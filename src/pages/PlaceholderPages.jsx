import PillCapsule from '../components/PillCapsule'

export function PrescriptionsPage() {
  return <ComingSoon title="Recetas de Medicamentos" icon="📋" pill="blue" />
}

export function RemindersPage() {
  return <ComingSoon title="Recordatorios" icon="🔔" pill="purple" />
}

function ComingSoon({ title, icon, pill }) {
  return (
    <div className="page-enter flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <PillCapsule color={pill} size="xl" animate />
      <div className="text-center">
        <p className="text-4xl mb-3">{icon}</p>
        <h1 className="font-display font-bold text-2xl text-white mb-2">{title}</h1>
        <p className="text-white text-opacity-40 text-sm max-w-sm">
          Esta sección está lista para conectarse. Comparte los endpoints de tu backend
          para terminar de integrarla.
        </p>
      </div>
      <div className="badge bg-teal-500 bg-opacity-15 text-teal-400 border border-teal-500 border-opacity-20 px-4 py-2 text-sm">
        Próximamente disponible
      </div>
    </div>
  )
}
