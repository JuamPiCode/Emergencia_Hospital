import { FUENTE_CSV, HOSPITALIZACIONES } from './hospitalizaciones.js';

export const ESTADOS = {
  espera: 'En espera',
  atencion: 'En atención',
  atendido: 'Atendido',
};

export const PRIORIDADES = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export const TURNOS = 8;
export const ALERTA_ESPERA = 60;

const CUENTAS = {
  admin: { nombre: 'Lucía Torres', rol: 'Administrador', clave: 'PulsoAdmin24', permisos: ['registro', 'estado', 'historial'] },
  medico: { nombre: 'Andrés Vega', rol: 'Médico', clave: 'PulsoMedico24', permisos: ['estado', 'historial'] },
  recepcion: { nombre: 'Paola Ríos', rol: 'Recepcionista', clave: 'PulsoRecepcion24', permisos: ['registro'] },
};

const DATOS_KEY = 'pulso.datos.v4';
const SESION_KEY = 'pulso.sesion.v1';
const minuto = 60_000;
let cacheDatos = null;

function cuentaPublica(usuario) {
  const cuenta = Object.hasOwn(CUENTAS, usuario) ? CUENTAS[usuario] : null;
  return cuenta ? { usuario, nombre: cuenta.nombre, rol: cuenta.rol, permisos: [...cuenta.permisos] } : null;
}

export function fechaLocal(valor) {
  const fecha = new Date(valor);
  return [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()]
    .map(parte => String(parte).padStart(2, '0')).join('-');
}

export function horaLocal(valor) {
  const fecha = new Date(valor);
  return [fecha.getHours(), fecha.getMinutes()].map(parte => String(parte).padStart(2, '0')).join(':');
}

function prioridadDesdeDiagnostico(diagnostico) {
  const texto = normalizar(diagnostico);
  if (/hemorragia|infarto|vascular encefalico|leucemia|tumor maligno|traumatismo intracranial|paro|shock|convulsiones/.test(texto)) return 'critica';
  if (/neumonia|fractura|diabetes|hipertension|anemia|miocarditis|fibrilacion|insuficiencia|asma|deshidratacion|crisis/.test(texto)) return 'alta';
  if (/obesidad|catarata|dermatitis|resfriado|esguince|cefalea leve/.test(texto)) return 'baja';
  return 'media';
}

function estadoDesdeIndice(indice) {
  const resto = indice % 5;
  if (resto === 0 || resto === 1) return 'espera';
  if (resto === 2) return 'atencion';
  return 'atendido';
}

function sembrar(ahora = new Date()) {
  const muestra = HOSPITALIZACIONES;
  const pacientes = muestra.map((fila, indice) => ({
    dni: String(90000001 + indice),
    nombre: fila.nombre,
    edad: fila.edad,
    sexo: fila.sexo,
    provincia: fila.provincia,
    distrito: fila.distrito,
  }));

  const casos = muestra.map((fila, indice) => {
    const minutos = 8 + (indice % 19) * 6;
    const ingreso = +ahora - minutos * minuto;
    const estado = estadoDesdeIndice(indice);
    return {
      id: `d2-${indice + 1}`,
      dni: pacientes[indice].dni,
      motivo: fila.diagnostico.slice(0, 280),
      prioridad: prioridadDesdeDiagnostico(fila.diagnostico),
      estado,
      ingreso,
      inicio: estado === 'espera' ? null : ingreso + 10 * minuto,
      fin: estado === 'atendido' ? ingreso + 32 * minuto : null,
      antecedentes: `Procedencia: ${fila.provincia} / ${fila.distrito}. Sexo: ${fila.sexo}. Fuente: ${FUENTE_CSV}.`,
      observaciones: estado === 'atendido'
        ? [{ texto: 'Atención de práctica registrada desde datos D2.', autor: 'Andrés Vega', fecha: ingreso + 28 * minuto }]
        : [],
    };
  });

  for (let dias = 1; dias <= 6; dias++) {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() - dias);
    fecha.setHours(8 + (dias % 3), 15, 0, 0);
    const cantidad = [0, 9, 6, 11, 7, 10, 5][dias];
    for (let indice = 0; indice < cantidad; indice++) {
      const paciente = pacientes[(dias * 3 + indice) % pacientes.length];
      const fila = muestra[(dias * 3 + indice) % muestra.length];
      const ingreso = +fecha + indice * 22 * minuto;
      casos.push({
        id: `d2-h-${dias}-${indice}`,
        dni: paciente.dni,
        motivo: fila.diagnostico.slice(0, 280),
        prioridad: prioridadDesdeDiagnostico(fila.diagnostico),
        estado: 'atendido',
        ingreso,
        inicio: ingreso + 16 * minuto,
        fin: ingreso + 40 * minuto,
        antecedentes: `Procedencia: ${fila.provincia} / ${fila.distrito}. Registro histórico de práctica.`,
        observaciones: [{ texto: 'Seguimiento histórico de práctica.', autor: 'Andrés Vega', fecha: ingreso + 36 * minuto }],
      });
    }
  }

  return { pacientes, casos, fuente: FUENTE_CSV };
}

function leer() {
  if (cacheDatos) return cacheDatos;
  const persistido = localStorage.getItem(DATOS_KEY);
  if (persistido) {
    try {
      const datos = JSON.parse(persistido);
      if (Array.isArray(datos?.pacientes) && Array.isArray(datos?.casos)) {
        cacheDatos = datos;
        return datos;
      }
    } catch {
      throw new Error('Los datos locales no se pudieron leer.');
    }
    throw new Error('Los datos locales tienen un formato incompatible.');
  }
  const datos = sembrar();
  guardar(datos);
  return datos;
}

function guardar(datos) {
  cacheDatos = datos;
  localStorage.setItem(DATOS_KEY, JSON.stringify(datos));
}

function requerir(permiso) {
  if (!repositorio.sesion()?.permisos.includes(permiso)) {
    throw new Error('Tu rol no tiene permiso para realizar esta acción.');
  }
}

function validarCaso(datos) {
  if (!/^\d{8}$/.test(datos.dni)) throw new Error('El DNI debe contener ocho dígitos.');
  if (datos.nombre.length > 100 || datos.nombre.split(/\s+/).length < 2 || !/^[\p{L}\p{M}][\p{L}\p{M} .’'-]*$/u.test(datos.nombre)) {
    throw new Error('Ingresa los nombres y apellidos del paciente.');
  }
  if (!Number.isInteger(datos.edad) || datos.edad < 0 || datos.edad > 120) throw new Error('Ingresa una edad entre 0 y 120 años.');
  if (!Number.isFinite(datos.ingreso) || datos.ingreso > Date.now()) throw new Error('Indica una fecha y hora de ingreso válida, hasta el momento actual.');
  if (datos.motivo.length < 3 || datos.motivo.length > 280) throw new Error('El motivo debe tener entre 3 y 280 caracteres.');
  if (!Object.hasOwn(PRIORIDADES, datos.prioridad)) throw new Error('Selecciona la prioridad indicada por el personal sanitario.');
}

export const repositorio = {
  credencialesDemo(usuario) {
    return cuentaPublica(usuario) ? { usuario, clave: CUENTAS[usuario].clave } : null;
  },
  iniciarSesion(usuario, clave) {
    const cuenta = cuentaPublica(usuario);
    if (!cuenta || CUENTAS[usuario].clave !== clave) return null;
    localStorage.setItem(SESION_KEY, usuario);
    return cuenta;
  },
  sesion() {
    return cuentaPublica(localStorage.getItem(SESION_KEY));
  },
  cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
  },
  async listar() {
    const sesion = this.sesion();
    if (!sesion) throw new Error('Inicia sesión para consultar los datos.');
    const datos = leer();
    return sesion.permisos.includes('historial') ? datos : {
      pacientes: datos.pacientes,
      casos: datos.casos.map(({ antecedentes, observaciones, ...caso }) => caso),
      fuente: datos.fuente,
    };
  },
  async registrar(datos) {
    requerir('registro');
    validarCaso(datos);
    const registros = leer();
    if (registros.casos.some(caso => caso.dni === datos.dni && caso.estado !== 'atendido')) {
      throw new Error('Este DNI ya tiene una atención abierta en la cola.');
    }
    const paciente = registros.pacientes.find(item => item.dni === datos.dni);
    if (paciente && normalizar(paciente.nombre) !== normalizar(datos.nombre)) {
      throw new Error('El DNI pertenece a otro nombre registrado. Revisa los datos.');
    }
    if (paciente) paciente.edad = datos.edad;
    else registros.pacientes.push({ dni: datos.dni, nombre: datos.nombre, edad: datos.edad });
    const id = crypto.randomUUID();
    registros.casos.push({
      id, dni: datos.dni, ingreso: datos.ingreso, motivo: datos.motivo, prioridad: datos.prioridad,
      estado: 'espera', inicio: null, fin: null, antecedentes: '', observaciones: [],
    });
    guardar(registros);
    return id;
  },
  async actualizarEstado(id, estado) {
    requerir('estado');
    const registros = leer();
    const caso = registros.casos.find(item => item.id === id);
    const siguiente = { espera: 'atencion', atencion: 'atendido' };
    if (!caso || siguiente[caso.estado] !== estado) throw new Error('El cambio de estado solicitado no está disponible.');
    const ahora = Math.max(Date.now(), caso.inicio ?? caso.ingreso);
    caso.estado = estado;
    if (estado === 'atencion') caso.inicio = ahora;
    if (estado === 'atendido') caso.fin = ahora;
    guardar(registros);
  },
  async agregarObservacion(id, texto) {
    requerir('historial');
    if (texto.length < 3 || texto.length > 600) throw new Error('La observación debe tener entre 3 y 600 caracteres.');
    const registros = leer();
    const caso = registros.casos.find(item => item.id === id);
    if (!caso) throw new Error('No se encontró la atención.');
    caso.observaciones.push({ texto, autor: this.sesion().nombre, fecha: Date.now() });
    guardar(registros);
  },
};

export function normalizar(valor) {
  return valor.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function minutosEspera(caso, ahora = Date.now()) {
  return Math.max(0, Math.floor(((caso.inicio ?? ahora) - caso.ingreso) / minuto));
}

export function ordenarCola(casos) {
  const prioridades = Object.keys(PRIORIDADES);
  return [...casos].sort((a, b) => prioridades.indexOf(a.prioridad) - prioridades.indexOf(b.prioridad) || a.ingreso - b.ingreso);
}

export function casosDelPanel(casos, ahora = Date.now()) {
  const hoy = fechaLocal(ahora);
  return casos.filter(caso => caso.estado !== 'atendido' || fechaLocal(caso.fin) === hoy);
}

export function resumen(casos, ahora = Date.now()) {
  const panel = casosDelPanel(casos, ahora);
  const espera = panel.filter(caso => caso.estado === 'espera');
  const atencion = panel.filter(caso => caso.estado === 'atencion').length;
  const atendido = panel.filter(caso => caso.estado === 'atendido').length;
  const tiempoPromedio = panel.length ? Math.round(panel.reduce((suma, caso) => suma + minutosEspera(caso, ahora), 0) / panel.length) : 0;
  return {
    total: panel.length, espera: espera.length, atencion, atendido, tiempoPromedio,
    extensas: espera.filter(caso => minutosEspera(caso, ahora) >= ALERTA_ESPERA).length,
    ocupacion: Math.round(atencion / TURNOS * 100),
  };
}

export function actividad(casos, dias, ahora = Date.now()) {
  const formato = new Intl.DateTimeFormat('es-PE', { weekday: 'short' });
  return Array.from({ length: dias }, (_, indice) => {
    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() - dias + 1 + indice);
    const dia = fechaLocal(fecha);
    return {
      dia,
      etiqueta: formato.format(fecha).replace('.', ''),
      ingresos: casos.filter(caso => fechaLocal(caso.ingreso) === dia).length,
      atendidos: casos.filter(caso => caso.fin !== null && fechaLocal(caso.fin) === dia).length,
    };
  });
}
