export const formatDate = (date, locale = "es-PE") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(dateObj);
};
export const formatDateTime = (date, locale = "es-PE") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(dateObj);
};
export const formatTime = (date, locale = "es-ES") => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });
};
export const formatRelativeTime = (date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMinutes < 1)
        return "Ahora mismo";
    if (diffInMinutes < 60)
        return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""}`;
    if (diffInHours < 24)
        return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    if (diffInDays < 7)
        return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
    return formatDate(dateObj);
};
export const formatCurrency = (amount, currency = "PEN", locale = "es-PE") => {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(amount);
};
export const formatNumber = (number, locale = "es-PE") => {
    return new Intl.NumberFormat(locale).format(number);
};
export const formatPercentage = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
};
export const formatFileSize = (bytes) => {
    if (bytes === 0)
        return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
export const formatBloodPressure = (systolic, diastolic) => {
    return `${systolic}/${diastolic} mmHg`;
};
export const formatHeartRate = (bpm) => {
    return `${bpm} lpm`;
};
export const formatTemperature = (temp) => {
    return `${temp.toFixed(1)}°C`;
};
export const formatWeight = (weight) => {
    return `${weight.toFixed(1)} kg`;
};
export const formatHeight = (height) => {
    return `${height} cm`;
};
export const formatBmi = (bmi) => {
    return `${bmi.toFixed(1)} kg/m²`;
};
export const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
export const capitalizeWords = (text) => {
    return text
        .split(" ")
        .map((word) => capitalize(word))
        .join(" ");
};
export const truncateText = (text, maxLength, suffix = "...") => {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};
export const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
};
export const formatDNI = (dni) => {
    const cleaned = dni.replace(/\D/g, "");
    if (cleaned.length === 8) {
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)} ${cleaned.slice(6)}`;
    }
    return dni;
};
export const formatAppointmentStatus = (status) => {
    const statusMap = {
        scheduled: "Programada",
        confirmed: "Confirmada",
        in_progress: "En Progreso",
        completed: "Completada",
        cancelled: "Cancelada",
        no_show: "No Asistió",
    };
    return statusMap[status] || status;
};
export const formatPrescriptionStatus = (status) => {
    const statusMap = {
        active: "Activa",
        completed: "Completada",
        cancelled: "Cancelada",
    };
    return statusMap[status] || status;
};
export const formatMedicalRecordStatus = (status) => {
    const statusMap = {
        active: "Activo",
        archived: "Archivado",
        pending: "Pendiente",
    };
    return statusMap[status] || status;
};
export const formatDuration = (minutes) => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
};
export const formatAge = (birthDate) => {
    const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return `${age} años`;
};
export const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
//# sourceMappingURL=formatting.js.map