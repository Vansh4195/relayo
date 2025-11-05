export interface TemplateVariables {
  name?: string;
  service?: string;
  date?: string;
  time?: string;
  business?: string;
  staff?: string;
}

/**
 * SMS Templates
 */
export const smsTemplates = {
  confirmation: (vars: TemplateVariables) =>
    `Hi ${vars.name}, your ${vars.service} is booked for ${vars.date} at ${vars.time} with ${vars.staff}. Reply YES to confirm or CANCEL to reschedule.`,

  reminder: (vars: TemplateVariables) =>
    `Reminder: You have a ${vars.service} appointment tomorrow at ${vars.time} with ${vars.staff}. See you soon!`,

  cancellation: (vars: TemplateVariables) =>
    `Your ${vars.service} appointment on ${vars.date} at ${vars.time} has been cancelled. Reply to reschedule.`,

  reschedule: (vars: TemplateVariables) =>
    `Your ${vars.service} appointment has been rescheduled to ${vars.date} at ${vars.time}. Reply YES to confirm.`,
};

/**
 * Email Templates
 */
export const emailTemplates = {
  confirmation: {
    subject: (vars: TemplateVariables) => `Appointment Confirmed: ${vars.service}`,
    html: (vars: TemplateVariables) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Confirmed</h2>
        <p>Hi ${vars.name},</p>
        <p>Your appointment has been confirmed:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${vars.service}</p>
          <p><strong>Date:</strong> ${vars.date}</p>
          <p><strong>Time:</strong> ${vars.time}</p>
          <p><strong>Staff:</strong> ${vars.staff}</p>
        </div>
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>${vars.business}</p>
      </div>
    `,
  },

  reminder: {
    subject: (vars: TemplateVariables) => `Reminder: ${vars.service} Tomorrow`,
    html: (vars: TemplateVariables) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Reminder</h2>
        <p>Hi ${vars.name},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${vars.service}</p>
          <p><strong>Date:</strong> ${vars.date}</p>
          <p><strong>Time:</strong> ${vars.time}</p>
        </div>
        <p>See you soon!</p>
        <p>Best regards,<br>${vars.business}</p>
      </div>
    `,
  },

  cancellation: {
    subject: (vars: TemplateVariables) => `Appointment Cancelled`,
    html: (vars: TemplateVariables) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Cancelled</h2>
        <p>Hi ${vars.name},</p>
        <p>Your appointment has been cancelled:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${vars.service}</p>
          <p><strong>Date:</strong> ${vars.date}</p>
          <p><strong>Time:</strong> ${vars.time}</p>
        </div>
        <p>Please contact us if you'd like to reschedule.</p>
        <p>Best regards,<br>${vars.business}</p>
      </div>
    `,
  },
};
