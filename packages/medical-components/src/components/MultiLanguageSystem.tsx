// 🌐 MULTI-LANGUAGE SUPPORT - ALTAMEDICA
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Check, Globe, Languages } from 'lucide-react';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Supported languages
export type SupportedLanguage = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'ca' | 'eu';

interface Language {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', isRTL: false },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isRTL: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isRTL: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isRTL: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', isRTL: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', isRTL: false },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿', isRTL: false },
  { code: 'eu', name: 'Basque', nativeName: 'Euskera', flag: '🏴󠁥󠁳󠁰󠁶󠁿', isRTL: false }
];

// Translation keys and values
interface Translations {
  // Common
  common: {
    welcome: string;
    hello: string;
    goodbye: string;
    yes: string;
    no: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    continue: string;
    finish: string;
  };
  
  // Medical specific
  medical: {
    patient: string;
    doctor: string;
    appointment: string;
    consultation: string;
    prescription: string;
    diagnosis: string;
    treatment: string;
    symptoms: string;
    medication: string;
    allergy: string;
    emergency: string;
    urgent: string;
    normal: string;
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
    height: string;
    age: string;
    gender: string;
    birthDate: string;
    medicalHistory: string;
    labResults: string;
    telemedicine: string;
    videoCall: string;
    chatMessage: string;
    shareVitals: string;
  };
  
  // UI Components
  ui: {
    dashboard: string;
    analytics: string;
    reports: string;
    settings: string;
    profile: string;
    notifications: string;
    calendar: string;
    payments: string;
    insurance: string;
    schedule: string;
    export: string;
    import: string;
    filter: string;
    sort: string;
    view: string;
    print: string;
    download: string;
    upload: string;
    share: string;
    copy: string;
    paste: string;
    cut: string;
    undo: string;
    redo: string;
  };
  
  // Messages
  messages: {
    loginSuccess: string;
    loginError: string;
    saveSuccess: string;
    saveError: string;
    deleteConfirm: string;
    deleteSuccess: string;
    deleteError: string;
    networkError: string;
    sessionExpired: string;
    accessDenied: string;
    dataNotFound: string;
    validationError: string;
    serverError: string;
    paymentSuccess: string;
    paymentError: string;
    appointmentScheduled: string;
    appointmentCancelled: string;
    prescriptionSent: string;
    vitalsShared: string;
    reportGenerated: string;
  };
}

// Translation data
const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  es: {
    common: {
      welcome: 'Bienvenido',
      hello: 'Hola',
      goodbye: 'Adiós',
      yes: 'Sí',
      no: 'No',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      close: 'Cerrar',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      continue: 'Continuar',
      finish: 'Finalizar',
    },
    medical: {
      patient: 'Paciente',
      doctor: 'Doctor',
      appointment: 'Cita',
      consultation: 'Consulta',
      prescription: 'Receta',
      diagnosis: 'Diagnóstico',
      treatment: 'Tratamiento',
      symptoms: 'Síntomas',
      medication: 'Medicación',
      allergy: 'Alergia',
      emergency: 'Emergencia',
      urgent: 'Urgente',
      normal: 'Normal',
      bloodPressure: 'Presión Arterial',
      heartRate: 'Ritmo Cardíaco',
      temperature: 'Temperatura',
      weight: 'Peso',
      height: 'Altura',
      age: 'Edad',
      gender: 'Género',
      birthDate: 'Fecha de Nacimiento',
      medicalHistory: 'Historia Médica',
      labResults: 'Resultados de Laboratorio',
      telemedicine: 'Telemedicina',
      videoCall: 'Videollamada',
      chatMessage: 'Mensaje de Chat',
      shareVitals: 'Compartir Vitales',
    },
    ui: {
      dashboard: 'Panel de Control',
      analytics: 'Análisis',
      reports: 'Reportes',
      settings: 'Configuración',
      profile: 'Perfil',
      notifications: 'Notificaciones',
      calendar: 'Calendario',
      payments: 'Pagos',
      insurance: 'Seguro',
      schedule: 'Horario',
      export: 'Exportar',
      import: 'Importar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      view: 'Ver',
      print: 'Imprimir',
      download: 'Descargar',
      upload: 'Subir',
      share: 'Compartir',
      copy: 'Copiar',
      paste: 'Pegar',
      cut: 'Cortar',
      undo: 'Deshacer',
      redo: 'Rehacer',
    },
    messages: {
      loginSuccess: 'Inicio de sesión exitoso',
      loginError: 'Error al iniciar sesión',
      saveSuccess: 'Guardado exitosamente',
      saveError: 'Error al guardar',
      deleteConfirm: '¿Está seguro de que desea eliminar este elemento?',
      deleteSuccess: 'Eliminado exitosamente',
      deleteError: 'Error al eliminar',
      networkError: 'Error de conexión de red',
      sessionExpired: 'La sesión ha expirado',
      accessDenied: 'Acceso denegado',
      dataNotFound: 'Datos no encontrados',
      validationError: 'Error de validación',
      serverError: 'Error del servidor',
      paymentSuccess: 'Pago procesado exitosamente',
      paymentError: 'Error al procesar el pago',
      appointmentScheduled: 'Cita programada exitosamente',
      appointmentCancelled: 'Cita cancelada',
      prescriptionSent: 'Receta enviada al paciente',
      vitalsShared: 'Signos vitales compartidos',
      reportGenerated: 'Reporte generado exitosamente',
    },
  },
  
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello',
      goodbye: 'Goodbye',
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      continue: 'Continue',
      finish: 'Finish',
    },
    medical: {
      patient: 'Patient',
      doctor: 'Doctor',
      appointment: 'Appointment',
      consultation: 'Consultation',
      prescription: 'Prescription',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      symptoms: 'Symptoms',
      medication: 'Medication',
      allergy: 'Allergy',
      emergency: 'Emergency',
      urgent: 'Urgent',
      normal: 'Normal',
      bloodPressure: 'Blood Pressure',
      heartRate: 'Heart Rate',
      temperature: 'Temperature',
      weight: 'Weight',
      height: 'Height',
      age: 'Age',
      gender: 'Gender',
      birthDate: 'Birth Date',
      medicalHistory: 'Medical History',
      labResults: 'Lab Results',
      telemedicine: 'Telemedicine',
      videoCall: 'Video Call',
      chatMessage: 'Chat Message',
      shareVitals: 'Share Vitals',
    },
    ui: {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      reports: 'Reports',
      settings: 'Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      calendar: 'Calendar',
      payments: 'Payments',
      insurance: 'Insurance',
      schedule: 'Schedule',
      export: 'Export',
      import: 'Import',
      filter: 'Filter',
      sort: 'Sort',
      view: 'View',
      print: 'Print',
      download: 'Download',
      upload: 'Upload',
      share: 'Share',
      copy: 'Copy',
      paste: 'Paste',
      cut: 'Cut',
      undo: 'Undo',
      redo: 'Redo',
    },
    messages: {
      loginSuccess: 'Login successful',
      loginError: 'Login error',
      saveSuccess: 'Saved successfully',
      saveError: 'Error saving',
      deleteConfirm: 'Are you sure you want to delete this item?',
      deleteSuccess: 'Deleted successfully',
      deleteError: 'Error deleting',
      networkError: 'Network connection error',
      sessionExpired: 'Session has expired',
      accessDenied: 'Access denied',
      dataNotFound: 'Data not found',
      validationError: 'Validation error',
      serverError: 'Server error',
      paymentSuccess: 'Payment processed successfully',
      paymentError: 'Payment processing error',
      appointmentScheduled: 'Appointment scheduled successfully',
      appointmentCancelled: 'Appointment cancelled',
      prescriptionSent: 'Prescription sent to patient',
      vitalsShared: 'Vital signs shared',
      reportGenerated: 'Report generated successfully',
    },
  },
  
  fr: {
    common: {
      welcome: 'Bienvenue',
      hello: 'Bonjour',
      goodbye: 'Au revoir',
      yes: 'Oui',
      no: 'Non',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      search: 'Rechercher',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      warning: 'Avertissement',
      info: 'Information',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      continue: 'Continuer',
      finish: 'Terminer',
    },
    medical: {
      patient: 'Patient',
      doctor: 'Docteur',
      appointment: 'Rendez-vous',
      consultation: 'Consultation',
      prescription: 'Ordonnance',
      diagnosis: 'Diagnostic',
      treatment: 'Traitement',
      symptoms: 'Symptômes',
      medication: 'Médicament',
      allergy: 'Allergie',
      emergency: 'Urgence',
      urgent: 'Urgent',
      normal: 'Normal',
      bloodPressure: 'Tension Artérielle',
      heartRate: 'Fréquence Cardiaque',
      temperature: 'Température',
      weight: 'Poids',
      height: 'Taille',
      age: 'Âge',
      gender: 'Genre',
      birthDate: 'Date de Naissance',
      medicalHistory: 'Antécédents Médicaux',
      labResults: 'Résultats de Laboratoire',
      telemedicine: 'Télémédecine',
      videoCall: 'Appel Vidéo',
      chatMessage: 'Message Chat',
      shareVitals: 'Partager les Vitales',
    },
    ui: {
      dashboard: 'Tableau de Bord',
      analytics: 'Analytiques',
      reports: 'Rapports',
      settings: 'Paramètres',
      profile: 'Profil',
      notifications: 'Notifications',
      calendar: 'Calendrier',
      payments: 'Paiements',
      insurance: 'Assurance',
      schedule: 'Horaire',
      export: 'Exporter',
      import: 'Importer',
      filter: 'Filtrer',
      sort: 'Trier',
      view: 'Voir',
      print: 'Imprimer',
      download: 'Télécharger',
      upload: 'Téléverser',
      share: 'Partager',
      copy: 'Copier',
      paste: 'Coller',
      cut: 'Couper',
      undo: 'Annuler',
      redo: 'Refaire',
    },
    messages: {
      loginSuccess: 'Connexion réussie',
      loginError: 'Erreur de connexion',
      saveSuccess: 'Enregistré avec succès',
      saveError: 'Erreur lors de l\'enregistrement',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cet élément?',
      deleteSuccess: 'Supprimé avec succès',
      deleteError: 'Erreur lors de la suppression',
      networkError: 'Erreur de connexion réseau',
      sessionExpired: 'La session a expiré',
      accessDenied: 'Accès refusé',
      dataNotFound: 'Données non trouvées',
      validationError: 'Erreur de validation',
      serverError: 'Erreur du serveur',
      paymentSuccess: 'Paiement traité avec succès',
      paymentError: 'Erreur de traitement du paiement',
      appointmentScheduled: 'Rendez-vous programmé avec succès',
      appointmentCancelled: 'Rendez-vous annulé',
      prescriptionSent: 'Ordonnance envoyée au patient',
      vitalsShared: 'Signes vitaux partagés',
      reportGenerated: 'Rapport généré avec succès',
    },
  },
  
  de: {
    common: {
      welcome: 'Willkommen',
      hello: 'Hallo',
      goodbye: 'Auf Wiedersehen',
      yes: 'Ja',
      no: 'Nein',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      search: 'Suchen',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolg',
      warning: 'Warnung',
      info: 'Information',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Vorherige',
      continue: 'Fortfahren',
      finish: 'Beenden',
    },
    medical: {
      patient: 'Patient',
      doctor: 'Arzt',
      appointment: 'Termin',
      consultation: 'Beratung',
      prescription: 'Rezept',
      diagnosis: 'Diagnose',
      treatment: 'Behandlung',
      symptoms: 'Symptome',
      medication: 'Medikament',
      allergy: 'Allergie',
      emergency: 'Notfall',
      urgent: 'Dringend',
      normal: 'Normal',
      bloodPressure: 'Blutdruck',
      heartRate: 'Herzfrequenz',
      temperature: 'Temperatur',
      weight: 'Gewicht',
      height: 'Größe',
      age: 'Alter',
      gender: 'Geschlecht',
      birthDate: 'Geburtsdatum',
      medicalHistory: 'Krankengeschichte',
      labResults: 'Laborergebnisse',
      telemedicine: 'Telemedizin',
      videoCall: 'Videoanruf',
      chatMessage: 'Chat-Nachricht',
      shareVitals: 'Vitalwerte teilen',
    },
    ui: {
      dashboard: 'Dashboard',
      analytics: 'Analytik',
      reports: 'Berichte',
      settings: 'Einstellungen',
      profile: 'Profil',
      notifications: 'Benachrichtigungen',
      calendar: 'Kalender',
      payments: 'Zahlungen',
      insurance: 'Versicherung',
      schedule: 'Zeitplan',
      export: 'Exportieren',
      import: 'Importieren',
      filter: 'Filter',
      sort: 'Sortieren',
      view: 'Ansicht',
      print: 'Drucken',
      download: 'Herunterladen',
      upload: 'Hochladen',
      share: 'Teilen',
      copy: 'Kopieren',
      paste: 'Einfügen',
      cut: 'Ausschneiden',
      undo: 'Rückgängig',
      redo: 'Wiederholen',
    },
    messages: {
      loginSuccess: 'Anmeldung erfolgreich',
      loginError: 'Anmeldefehler',
      saveSuccess: 'Erfolgreich gespeichert',
      saveError: 'Fehler beim Speichern',
      deleteConfirm: 'Sind Sie sicher, dass Sie dieses Element löschen möchten?',
      deleteSuccess: 'Erfolgreich gelöscht',
      deleteError: 'Fehler beim Löschen',
      networkError: 'Netzwerkverbindungsfehler',
      sessionExpired: 'Sitzung ist abgelaufen',
      accessDenied: 'Zugang verweigert',
      dataNotFound: 'Daten nicht gefunden',
      validationError: 'Validierungsfehler',
      serverError: 'Serverfehler',
      paymentSuccess: 'Zahlung erfolgreich verarbeitet',
      paymentError: 'Zahlungsverarbeitungsfehler',
      appointmentScheduled: 'Termin erfolgreich geplant',
      appointmentCancelled: 'Termin abgesagt',
      prescriptionSent: 'Rezept an Patient gesendet',
      vitalsShared: 'Vitalzeichen geteilt',
      reportGenerated: 'Bericht erfolgreich erstellt',
    },
  },
  
  it: {
    common: {
      welcome: 'Benvenuto',
      hello: 'Ciao',
      goodbye: 'Arrivederci',
      yes: 'Sì',
      no: 'No',
      cancel: 'Annulla',
      save: 'Salva',
      delete: 'Elimina',
      edit: 'Modifica',
      add: 'Aggiungi',
      search: 'Cerca',
      loading: 'Caricamento...',
      error: 'Errore',
      success: 'Successo',
      warning: 'Avvertimento',
      info: 'Informazione',
      close: 'Chiudi',
      back: 'Indietro',
      next: 'Avanti',
      previous: 'Precedente',
      continue: 'Continua',
      finish: 'Finisci',
    },
    medical: {
      patient: 'Paziente',
      doctor: 'Dottore',
      appointment: 'Appuntamento',
      consultation: 'Consultazione',
      prescription: 'Prescrizione',
      diagnosis: 'Diagnosi',
      treatment: 'Trattamento',
      symptoms: 'Sintomi',
      medication: 'Farmaco',
      allergy: 'Allergia',
      emergency: 'Emergenza',
      urgent: 'Urgente',
      normal: 'Normale',
      bloodPressure: 'Pressione Sanguigna',
      heartRate: 'Frequenza Cardiaca',
      temperature: 'Temperatura',
      weight: 'Peso',
      height: 'Altezza',
      age: 'Età',
      gender: 'Genere',
      birthDate: 'Data di Nascita',
      medicalHistory: 'Storia Medica',
      labResults: 'Risultati di Laboratorio',
      telemedicine: 'Telemedicina',
      videoCall: 'Videochiamata',
      chatMessage: 'Messaggio Chat',
      shareVitals: 'Condividi Vitali',
    },
    ui: {
      dashboard: 'Cruscotto',
      analytics: 'Analisi',
      reports: 'Rapporti',
      settings: 'Impostazioni',
      profile: 'Profilo',
      notifications: 'Notifiche',
      calendar: 'Calendario',
      payments: 'Pagamenti',
      insurance: 'Assicurazione',
      schedule: 'Orario',
      export: 'Esporta',
      import: 'Importa',
      filter: 'Filtro',
      sort: 'Ordina',
      view: 'Visualizza',
      print: 'Stampa',
      download: 'Scarica',
      upload: 'Carica',
      share: 'Condividi',
      copy: 'Copia',
      paste: 'Incolla',
      cut: 'Taglia',
      undo: 'Annulla',
      redo: 'Ripeti',
    },
    messages: {
      loginSuccess: 'Accesso effettuato con successo',
      loginError: 'Errore di accesso',
      saveSuccess: 'Salvato con successo',
      saveError: 'Errore nel salvataggio',
      deleteConfirm: 'Sei sicuro di voler eliminare questo elemento?',
      deleteSuccess: 'Eliminato con successo',
      deleteError: 'Errore nell\'eliminazione',
      networkError: 'Errore di connessione di rete',
      sessionExpired: 'La sessione è scaduta',
      accessDenied: 'Accesso negato',
      dataNotFound: 'Dati non trovati',
      validationError: 'Errore di validazione',
      serverError: 'Errore del server',
      paymentSuccess: 'Pagamento elaborato con successo',
      paymentError: 'Errore nell\'elaborazione del pagamento',
      appointmentScheduled: 'Appuntamento programmato con successo',
      appointmentCancelled: 'Appuntamento cancellato',
      prescriptionSent: 'Prescrizione inviata al paziente',
      vitalsShared: 'Segni vitali condivisi',
      reportGenerated: 'Rapporto generato con successo',
    },
  },
  
  pt: {
    common: {
      welcome: 'Bem-vindo',
      hello: 'Olá',
      goodbye: 'Tchau',
      yes: 'Sim',
      no: 'Não',
      cancel: 'Cancelar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      search: 'Pesquisar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      warning: 'Aviso',
      info: 'Informação',
      close: 'Fechar',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      continue: 'Continuar',
      finish: 'Finalizar',
    },
    medical: {
      patient: 'Paciente',
      doctor: 'Médico',
      appointment: 'Consulta',
      consultation: 'Consulta',
      prescription: 'Receita',
      diagnosis: 'Diagnóstico',
      treatment: 'Tratamento',
      symptoms: 'Sintomas',
      medication: 'Medicação',
      allergy: 'Alergia',
      emergency: 'Emergência',
      urgent: 'Urgente',
      normal: 'Normal',
      bloodPressure: 'Pressão Arterial',
      heartRate: 'Frequência Cardíaca',
      temperature: 'Temperatura',
      weight: 'Peso',
      height: 'Altura',
      age: 'Idade',
      gender: 'Gênero',
      birthDate: 'Data de Nascimento',
      medicalHistory: 'Histórico Médico',
      labResults: 'Resultados de Laboratório',
      telemedicine: 'Telemedicina',
      videoCall: 'Videochamada',
      chatMessage: 'Mensagem de Chat',
      shareVitals: 'Compartilhar Sinais Vitais',
    },
    ui: {
      dashboard: 'Painel',
      analytics: 'Análises',
      reports: 'Relatórios',
      settings: 'Configurações',
      profile: 'Perfil',
      notifications: 'Notificações',
      calendar: 'Calendário',
      payments: 'Pagamentos',
      insurance: 'Seguro',
      schedule: 'Agenda',
      export: 'Exportar',
      import: 'Importar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      view: 'Visualizar',
      print: 'Imprimir',
      download: 'Baixar',
      upload: 'Carregar',
      share: 'Compartilhar',
      copy: 'Copiar',
      paste: 'Colar',
      cut: 'Cortar',
      undo: 'Desfazer',
      redo: 'Refazer',
    },
    messages: {
      loginSuccess: 'Login realizado com sucesso',
      loginError: 'Erro no login',
      saveSuccess: 'Salvo com sucesso',
      saveError: 'Erro ao salvar',
      deleteConfirm: 'Tem certeza que deseja excluir este item?',
      deleteSuccess: 'Excluído com sucesso',
      deleteError: 'Erro ao excluir',
      networkError: 'Erro de conexão de rede',
      sessionExpired: 'A sessão expirou',
      accessDenied: 'Acesso negado',
      dataNotFound: 'Dados não encontrados',
      validationError: 'Erro de validação',
      serverError: 'Erro do servidor',
      paymentSuccess: 'Pagamento processado com sucesso',
      paymentError: 'Erro ao processar pagamento',
      appointmentScheduled: 'Consulta agendada com sucesso',
      appointmentCancelled: 'Consulta cancelada',
      prescriptionSent: 'Receita enviada ao paciente',
      vitalsShared: 'Sinais vitais compartilhados',
      reportGenerated: 'Relatório gerado com sucesso',
    },
  },
  
  ca: {
    common: {
      welcome: 'Benvingut',
      hello: 'Hola',
      goodbye: 'Adéu',
      yes: 'Sí',
      no: 'No',
      cancel: 'Cancel·lar',
      save: 'Desar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Afegir',
      search: 'Cercar',
      loading: 'Carregant...',
      error: 'Error',
      success: 'Èxit',
      warning: 'Advertència',
      info: 'Informació',
      close: 'Tancar',
      back: 'Enrere',
      next: 'Següent',
      previous: 'Anterior',
      continue: 'Continuar',
      finish: 'Finalitzar',
    },
    medical: {
      patient: 'Pacient',
      doctor: 'Metge',
      appointment: 'Cita',
      consultation: 'Consulta',
      prescription: 'Recepta',
      diagnosis: 'Diagnòstic',
      treatment: 'Tractament',
      symptoms: 'Símptomes',
      medication: 'Medicació',
      allergy: 'Al·lèrgia',
      emergency: 'Emergència',
      urgent: 'Urgent',
      normal: 'Normal',
      bloodPressure: 'Pressió Arterial',
      heartRate: 'Ritme Cardíac',
      temperature: 'Temperatura',
      weight: 'Pes',
      height: 'Alçada',
      age: 'Edat',
      gender: 'Gènere',
      birthDate: 'Data de Naixement',
      medicalHistory: 'Historial Mèdic',
      labResults: 'Resultats de Laboratori',
      telemedicine: 'Telemedicina',
      videoCall: 'Videotrucada',
      chatMessage: 'Missatge de Xat',
      shareVitals: 'Compartir Vitals',
    },
    ui: {
      dashboard: 'Tauler de Control',
      analytics: 'Analítiques',
      reports: 'Informes',
      settings: 'Configuració',
      profile: 'Perfil',
      notifications: 'Notificacions',
      calendar: 'Calendari',
      payments: 'Pagaments',
      insurance: 'Assegurança',
      schedule: 'Horari',
      export: 'Exportar',
      import: 'Importar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      view: 'Veure',
      print: 'Imprimir',
      download: 'Descarregar',
      upload: 'Pujar',
      share: 'Compartir',
      copy: 'Copiar',
      paste: 'Enganxar',
      cut: 'Tallar',
      undo: 'Desfer',
      redo: 'Refer',
    },
    messages: {
      loginSuccess: 'Inici de sessió exitós',
      loginError: 'Error a l\'iniciar sessió',
      saveSuccess: 'Desat exitosament',
      saveError: 'Error al desar',
      deleteConfirm: 'Esteu segur que voleu eliminar aquest element?',
      deleteSuccess: 'Eliminat exitosament',
      deleteError: 'Error a l\'eliminar',
      networkError: 'Error de connexió de xarxa',
      sessionExpired: 'La sessió ha expirat',
      accessDenied: 'Accés denegat',
      dataNotFound: 'Dades no trobades',
      validationError: 'Error de validació',
      serverError: 'Error del servidor',
      paymentSuccess: 'Pagament processat exitosament',
      paymentError: 'Error al processar el pagament',
      appointmentScheduled: 'Cita programada exitosament',
      appointmentCancelled: 'Cita cancel·lada',
      prescriptionSent: 'Recepta enviada al pacient',
      vitalsShared: 'Signes vitals compartits',
      reportGenerated: 'Informe generat exitosament',
    },
  },
  
  eu: {
    common: {
      welcome: 'Ongi etorri',
      hello: 'Kaixo',
      goodbye: 'Agur',
      yes: 'Bai',
      no: 'Ez',
      cancel: 'Ezeztatu',
      save: 'Gorde',
      delete: 'Ezabatu',
      edit: 'Editatu',
      add: 'Gehitu',
      search: 'Bilatu',
      loading: 'Kargatzen...',
      error: 'Errorea',
      success: 'Arrakasta',
      warning: 'Abisua',
      info: 'Informazioa',
      close: 'Itxi',
      back: 'Itzuli',
      next: 'Hurrengoa',
      previous: 'Aurrekoa',
      continue: 'Jarraitu',
      finish: 'Amaitu',
    },
    medical: {
      patient: 'Gaixoa',
      doctor: 'Medikua',
      appointment: 'Hitzordua',
      consultation: 'Kontsulta',
      prescription: 'Errezetak',
      diagnosis: 'Diagnostikoa',
      treatment: 'Tratamendua',
      symptoms: 'Sintomak',
      medication: 'Medikamentua',
      allergy: 'Alergia',
      emergency: 'Larrialdi',
      urgent: 'Premiazkoa',
      normal: 'Normala',
      bloodPressure: 'Odol Presioa',
      heartRate: 'Bihotz Maiztasuna',
      temperature: 'Tenperatura',
      weight: 'Pisua',
      height: 'Altuera',
      age: 'Adina',
      gender: 'Generoa',
      birthDate: 'Jaiotze Data',
      medicalHistory: 'Historia Medikoa',
      labResults: 'Laboratorio Emaitzak',
      telemedicine: 'Telemedizina',
      videoCall: 'Bideo Deia',
      chatMessage: 'Txat Mezua',
      shareVitals: 'Bizitza Seinaleok Partekatu',
    },
    ui: {
      dashboard: 'Kontrol Panela',
      analytics: 'Analitikak',
      reports: 'Txostenak',
      settings: 'Ezarpenak',
      profile: 'Profila',
      notifications: 'Jakinarazpenak',
      calendar: 'Egutegia',
      payments: 'Ordainketak',
      insurance: 'Asegurua',
      schedule: 'Ordutegia',
      export: 'Esportatu',
      import: 'Inportatu',
      filter: 'Iragazi',
      sort: 'Ordenatu',
      view: 'Ikusi',
      print: 'Inprimatu',
      download: 'Deskargatu',
      upload: 'Kargatu',
      share: 'Partekatu',
      copy: 'Kopiatu',
      paste: 'Itsatsi',
      cut: 'Moztu',
      undo: 'Desegin',
      redo: 'Berregin',
    },
    messages: {
      loginSuccess: 'Saioa hasita behar bezala',
      loginError: 'Saioa hasteko errorea',
      saveSuccess: 'Behar bezala gordeta',
      saveError: 'Gordetzeko errorea',
      deleteConfirm: 'Ziur zaude elementu hau ezabatu nahi duzula?',
      deleteSuccess: 'Behar bezala ezabatuta',
      deleteError: 'Ezabatzeko errorea',
      networkError: 'Sare konexio errorea',
      sessionExpired: 'Saioa iraungi da',
      accessDenied: 'Sarbidea ukatuta',
      dataNotFound: 'Datuak ez dira aurkitu',
      validationError: 'Balidazio errorea',
      serverError: 'Zerbitzari errorea',
      paymentSuccess: 'Ordainketa behar bezala prozesatuta',
      paymentError: 'Ordainketa prozesatzeko errorea',
      appointmentScheduled: 'Hitzordua behar bezala programatuta',
      appointmentCancelled: 'Hitzordua bertan behera utzi da',
      prescriptionSent: 'Errezeta gaixoari bidali zaio',
      vitalsShared: 'Bizitza seinaleok partekatuta',
      reportGenerated: 'Txostena behar bezala sortuta',
    },
  },
};

// Language Context
interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
  formatMessage: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested translation
const getNestedTranslation = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

// Language Provider
interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage = 'es'
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('altamedica-language') as SupportedLanguage;
    if (savedLanguage && SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem('altamedica-language', currentLanguage);
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    
    // Update HTML dir attribute for RTL languages
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage);
    document.documentElement.dir = language?.isRTL ? 'rtl' : 'ltr';
  }, [currentLanguage]);

  const setLanguage = async (language: SupportedLanguage) => {
    setIsLoading(true);
    
    // Simulate loading time for language switching
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCurrentLanguage(language);
    setIsLoading(false);
    
    // Trigger a custom event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language, translations: TRANSLATIONS[language] } 
    }));
  };

  const t = (key: string): string => {
    const currentTranslations = TRANSLATIONS[currentLanguage];
    return getNestedTranslation(currentTranslations, key);
  };

  const formatMessage = (key: string, params?: Record<string, string | number>): string => {
    let message = t(key);
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        message = message.replace(new RegExp(`{${param}}`, 'g'), String(value));
      });
    }
    
    return message;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    formatMessage,
    isLoading,
    availableLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Selector Component
export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, availableLanguages, isLoading } = useLanguage();

  const getCurrentLanguage = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage);
  };

  return (
    <Select value={currentLanguage} onValueChange={setLanguage} disabled={isLoading}>
      <SelectTrigger className="w-48">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span>{getCurrentLanguage()?.flag}</span>
            <span>{getCurrentLanguage()?.nativeName}</span>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.nativeName}</span>
              {language.code === currentLanguage && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Multi-Language Demo Component
export const MultiLanguageDemo: React.FC = () => {
  const { t, currentLanguage, availableLanguages } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="h-8 w-8 text-blue-600" />
              {t('ui.settings')} - {t('common.welcome')}
            </h1>
            <p className="text-gray-600 mt-1">
              Sistema de soporte multi-idioma para Altamedica
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </div>

        {/* Language Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Idiomas Soportados</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {availableLanguages.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Languages className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Incluyendo idiomas regionales
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Idioma Actual</p>
                  <p className="text-2xl font-bold text-green-600">
                    {availableLanguages.find(lang => lang.code === currentLanguage)?.nativeName}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">
                    {availableLanguages.find(lang => lang.code === currentLanguage)?.flag}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {availableLanguages.find(lang => lang.code === currentLanguage)?.name}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cobertura</p>
                  <p className="text-2xl font-bold text-purple-600">
                    100%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Check className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Todas las traducciones completadas
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Translation Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Ejemplos de Traducción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Common Translations */}
              <div>
                <h3 className="font-medium mb-4">Términos Comunes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Bienvenido:</span>
                    <span className="font-medium">{t('common.welcome')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Guardar:</span>
                    <span className="font-medium">{t('common.save')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Cancelar:</span>
                    <span className="font-medium">{t('common.cancel')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Buscar:</span>
                    <span className="font-medium">{t('common.search')}</span>
                  </div>
                </div>
              </div>

              {/* Medical Translations */}
              <div>
                <h3 className="font-medium mb-4">Términos Médicos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Paciente:</span>
                    <span className="font-medium">{t('medical.patient')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">{t('medical.doctor')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Cita:</span>
                    <span className="font-medium">{t('medical.appointment')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Presión Arterial:</span>
                    <span className="font-medium">{t('medical.bloodPressure')}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Languages */}
        <Card>
          <CardHeader>
            <CardTitle>Idiomas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableLanguages.map((language) => (
                <div 
                  key={language.code}
                  className={`p-4 border rounded-lg text-center cursor-pointer transition-colors ${
                    language.code === currentLanguage 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{language.flag}</div>
                  <div className="font-medium text-sm">{language.nativeName}</div>
                  <div className="text-xs text-gray-500">{language.name}</div>
                  {language.code === currentLanguage && (
                    <div className="mt-2">
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Implementación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Sistema de traducciones completo</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>8 idiomas soportados</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Persistencia en localStorage</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Cambio dinámico de idioma</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>Soporte para idiomas regionales</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Formateo de fechas por región (pendiente)</span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span>Soporte RTL para árabe/hebreo (futuro)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Export the hook and components
export default {
  LanguageProvider,
  useLanguage,
  LanguageSelector,
  MultiLanguageDemo,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS
};
