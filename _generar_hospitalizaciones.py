# -*- coding: utf-8 -*-
"""Genera hospitalizaciones.js con muestra de práctica estilo D2."""
import json
from pathlib import Path

NOMBRES_M = [
    'Luis', 'Carlos', 'José', 'Miguel', 'Andrés', 'Diego', 'Mateo', 'Gabriel', 'Alonso', 'Joaquín',
    'Ricardo', 'Fernando', 'Héctor', 'Óscar', 'Pedro', 'Javier', 'Martín', 'Raúl', 'Sergio', 'Tomás',
    'Bruno', 'Iván', 'Esteban', 'Nicolás', 'Álvaro',
]
NOMBRES_F = [
    'María', 'Ana', 'Lucía', 'Camila', 'Valeria', 'Sofía', 'Elena', 'Renata', 'Mariana', 'Paola',
    'Carmen', 'Rosa', 'Patricia', 'Claudia', 'Daniela', 'Andrea', 'Gabriela', 'Isabel', 'Julia', 'Natalia',
    'Jimena', 'Adriana', 'Mónica', 'Verónica', 'Karina',
]
APELLIDOS = [
    'García', 'Rodríguez', 'Martínez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores',
    'Vargas', 'Castillo', 'Rojas', 'Mendoza', 'Silva', 'Cruz', 'Reyes', 'Morales', 'Ortiz', 'Navarro',
    'Quispe', 'Huamán', 'Chávez', 'Paredes', 'Salas', 'Campos', 'Arias', 'León', 'Núñez', 'Soto',
    'Delgado', 'Cáceres', 'Ríos', 'Vega', 'Ponce',
]

LUGARES = [
    ('LIMA', 'JESUS MARIA'), ('LIMA', 'MIRAFLORES'), ('LIMA', 'SAN BORJA'), ('LIMA', 'LA VICTORIA'),
    ('CALLAO', 'CALLAO'), ('AREQUIPA', 'CAYMA'), ('CUSCO', 'CUSCO'), ('CANCHIS', 'SICUANI'),
    ('PASCO', 'YANACANCHA'), ('HUANCAYO', 'EL TAMBO'), ('TRUJILLO', 'TRUJILLO'), ('PIURA', 'PIURA'),
    ('CHICLAYO', 'CHICLAYO'), ('ICA', 'ICA'), ('TACNA', 'TACNA'), ('PUNO', 'PUNO'),
    ('AYACUCHO', 'HUAMANGA'), ('HUANUCO', 'HUANUCO'), ('CAJAMARCA', 'CAJAMARCA'), ('LORETO', 'IQUITOS'),
    ('UCAYALI', 'CALLERIA'), ('JUNIN', 'HUANCAYO'), ('ANCASH', 'HUARAZ'), ('CARHUAZ', 'CARHUAZ'),
]

DIAGNOSTICOS = [
    'Neumonía, no especificada',
    'Hipertensión esencial (primaria)',
    'Diabetes mellitus no insulinodependiente, sin mención de complicación',
    'Dolor abdominal agudo',
    'Fractura de antebrazo, parte no especificada',
    'Cefalea',
    'Gastroenteritis y colitis de origen no especificado',
    'Anemia de tipo no especificado',
    'Fibrilación auricular persistente',
    'Infarto agudo del miocardio, sin otra especificación',
    'Accidente vascular encefálico agudo, no especificado',
    'Asma, no especificada',
    'Infección de vías urinarias, sitio no especificado',
    'Traumatismo craneal superficial',
    'Herida de la pierna, parte no especificada',
    'Deshidratación',
    'Crisis hipertensiva',
    'Dolor torácico, no especificado',
    'Convulsiones, no especificadas',
    'Insuficiencia cardiaca congestiva',
    'Leucemia mieloide aguda',
    'Tumor maligno del esófago, parte no especificada',
    'Catarata senil nuclear',
    'Obesidad debida a exceso de calorías',
    'Erisipela',
    'Mieloma múltiple',
    'Síndrome del seno enfermo',
    'Ictericia neonatal, no especificada',
    'Diabetes mellitus no insulinodependiente, con otras complicaciones especificadas',
    'Nefritis tubulointersticial aguda',
    'Otros dolores abdominales y los no especificados',
    'Hemorragia subaracnoidea de sifón y bifurcación carotídea',
    'Otras miocarditis agudas',
    'Calculo de conducto biliar sin colangitis ni colecistitis',
    'Presencia de otros injertos y prótesis cardiovasculares',
    'Degeneración de la mácula y del polo posterior del ojo',
    'Tumor benigno de las meninges cerebrales',
    'Malformación de los vasos coronarios',
    'Amputación traumática de otro dedo único (completa) (parcial)',
    'Enfermedad del esófago, no especificada',
]


def elegir(lista, semilla):
    return lista[abs(semilla) % len(lista)]


out = []
for i in range(120):
    sexo = 'Femenino' if i % 2 else 'Masculino'
    nombres = NOMBRES_F if sexo == 'Femenino' else NOMBRES_M
    provincia, distrito = elegir(LUGARES, i * 17 + 2)
    edad = 1 + ((i * 13 + 7) % 90)
    if i % 11 == 0:
        edad = 1 + (i % 12)  # pediátricos dispersos
    out.append({
        'provincia': provincia,
        'distrito': distrito,
        'sexo': sexo,
        'edad': edad,
        'diagnostico': elegir(DIAGNOSTICOS, i * 5 + 1),
        'nombre': f'{elegir(nombres, i * 7 + 3)} {elegir(APELLIDOS, i * 11 + 5)} {elegir(APELLIDOS, i * 13 + 9)}',
    })

contenido = (
    '// Muestra de práctica estilo Consulta_D2_Hospitalizaciones (nombres ficticios).\n'
    'export const FUENTE_CSV = "Consulta_D2_Hospitalizaciones";\n'
    'export const HOSPITALIZACIONES = '
    + json.dumps(out, ensure_ascii=False, indent=2)
    + ';\n'
)
Path('hospitalizaciones.js').write_text(contenido, encoding='utf-8')
print('generados', len(out))
