/**
 * WhatsApp Arabic Message Templates
 *
 * Simple configuration for Arabic WhatsApp reminder messages.
 * Edit these templates to customize your messages.
 */

// Simple Arabic message template
export const ARABIC_MESSAGES = {
  default: {
    title: "🔔 تذكير الاشتراك",
    greeting: "مرحباً {userName}! 👋",
    main: 'سوف ينتهي اشتراكك في خدمة {serviceName} للحساب "{accountName}" خلال {expiresInDays} أيام في تاريخ {expirationDate}.',
    action: "⚠ لتجنب انقطاع الخدمة، يرجى تجديد اشتراكك قبل تاريخ الانتهاء.",
  },
};

/**
 * Build Arabic message from template
 */
export function createArabicMessage(
  daysAhead: number,
  variables: {
    userName: string;
    accountName: string;
    serviceName: string;
    expirationDate: string;
    expiresInDays: number;
  }
): string {
  // Use the default template (simplified)
  const template = ARABIC_MESSAGES.default;

  // Replace placeholders
  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/{userName}/g, variables.userName)
      .replace(/{accountName}/g, variables.accountName)
      .replace(/{serviceName}/g, variables.serviceName)
      .replace(/{expirationDate}/g, variables.expirationDate)
      .replace(/{expiresInDays}/g, variables.expiresInDays.toString());
  };

  // Build complete message (simplified format)
  let message = `${replacePlaceholders(template.title)}\n\n`;
  message += `${replacePlaceholders(template.greeting)}\n\n`;
  message += `${replacePlaceholders(template.main)}\n\n`;
  message += `${replacePlaceholders(template.action)}`;

  return message;
}
