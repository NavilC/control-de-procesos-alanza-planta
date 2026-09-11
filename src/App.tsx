import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavBar } from './components/layout/TopNavBar';
import { DashboardView } from './components/views/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { PiecesView } from './components/views/PiecesView';
import { QCInspectionsView } from './components/views/QCInspectionsView';
import { ShipmentsView } from './components/views/ShipmentsView';
import { FieldReceptionView } from './components/views/FieldReceptionView';
import { InventoryView } from './components/views/InventoryView';
import { IncidentsView } from './components/views/IncidentsView';
import { ReportsView } from './components/views/ReportsView';
import { UsersView } from './components/views/UsersView';
import { SettingsView } from './components/views/SettingsView';
import { ContratistasView } from './components/views/ContratistasView';
import { AssemblyGridView } from './components/views/AssemblyGridView';

import { TraceabilityModal } from './components/modals/TraceabilityModal';
import { QCInspectionModal } from './components/modals/QCInspectionModal';
import { PieceDetailModal } from './components/modals/PieceDetailModal';
import { DigitalSignatureModal } from './components/modals/DigitalSignatureModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { NewPieceModal } from './components/modals/NewPieceModal';
import { NewShipmentModal } from './components/modals/NewShipmentModal';
import { NewIncidentModal } from './components/modals/NewIncidentModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';
import { PrintableManifestModal } from './components/modals/PrintableManifestModal';
import { NewContractorModal } from './components/modals/NewContractorModal';
import { AssignWorkModal } from './components/modals/AssignWorkModal';
import { ContractorHistoryModal } from './components/modals/ContractorHistoryModal';
import { EditPieceModal } from './components/modals/EditPieceModal';
import { PieceModificationHistoryModal } from './components/modals/PieceModificationHistoryModal';
import { ImportPiecesModal } from './components/modals/ImportPiecesModal';
import { PieceQRModal } from './components/modals/PieceQRModal';
import { BatchPieceQRLabelsModal } from './components/modals/BatchPieceQRLabelsModal';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/views/LoginView';

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'proyectos':
        return <ProjectsView />;
      case 'piezas':
        return <PiecesView />;
      case 'contratistas':
        return <ContratistasView />;
      case 'qc':
        return <QCInspectionsView />;
      case 'envios':
        return <ShipmentsView />;
      case 'recepcion':
        return <FieldReceptionView />;
      case 'esquema':
        return <AssemblyGridView />;
      case 'inventario':
        return <InventoryView />;
      case 'incidencias':
        return <IncidentsView />;
      case 'reportes':
        return <ReportsView />;
      case 'usuarios':
        return <UsersView />;
      case 'configuracion':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f3ff] text-[#151c27] font-['Inter',sans-serif]">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top App Bar */}
        <TopNavBar />

        {/* Dynamic Content Canvas with smooth scrolling */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Interactive Modals */}
      <TraceabilityModal />
      <QCInspectionModal />
      <PieceDetailModal />
      <DigitalSignatureModal />
      <NewProjectModal />
      <NewPieceModal />
      <NewShipmentModal />
      <NewIncidentModal />
      <StockAdjustModal />
      <PrintableManifestModal />
      <NewContractorModal />
      <AssignWorkModal />
      <ContractorHistoryModal />
      <EditPieceModal />
      <PieceModificationHistoryModal />
      <ImportPiecesModal />
      <PieceQRModal />
      <BatchPieceQRLabelsModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
