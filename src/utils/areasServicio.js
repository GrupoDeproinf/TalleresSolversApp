// Nombre corto de cada área del catálogo de servicios (las burbujas grandes
// del registro). Se usa en el selector y en el perfil del negocio, donde se
// muestran las áreas (especialidades generales) y no cada servicio, para no
// saturar la pantalla.
export const NOMBRE_AREA = {
  mantenimiento: 'Mantenimiento',
  frenos: 'Frenos',
  suspension: 'Suspensión y dirección',
  electrico: 'Electricidad',
  climatizacion: 'Aire acondicionado',
  motor: 'Motor',
  transmision: 'Caja y embrague',
  escape: 'Escape',
  latoneria: 'Latonería y pintura',
  autolavado: 'Autolavado',
  tapiceria: 'Tapicería',
  vidrios: 'Parabrisas y vidrios',
  gas: 'Gas vehicular',
  motos: 'Motos',
};

/** Áreas de las especialidades, sin repetir y en el orden en que se eligieron. */
export const areasDeEspecialidades = especialidades => {
  const vistas = [];
  (Array.isArray(especialidades) ? especialidades : []).forEach(e => {
    const nombre = NOMBRE_AREA[e && e.grupo];
    if (nombre && !vistas.includes(nombre)) vistas.push(nombre);
  });
  return vistas;
};
