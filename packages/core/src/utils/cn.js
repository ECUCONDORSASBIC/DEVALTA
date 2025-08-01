import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function medicalClass(condition, trueClass, falseClass) {
    return condition ? trueClass : falseClass || "";
}
export function statusClass(status) {
    const statusClasses = {
        success: "text-green-600 bg-green-50 border-green-200",
        warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
        error: "text-red-600 bg-red-50 border-red-200",
        info: "text-blue-600 bg-blue-50 border-blue-200",
    };
    return statusClasses[status] || statusClasses.info;
}
//# sourceMappingURL=cn.js.map