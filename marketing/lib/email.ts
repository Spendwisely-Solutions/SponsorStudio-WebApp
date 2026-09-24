import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';

export const sendContactEmail = async (formData: {
  name: string;
  email: string;
  phone: string;
  message: string;
  organization_type: string;
}) => {
  try {
    // Send email to connect@sponsorstudio.in
    await emailjs.send(
      'service_f8hd0bm',
      'template_5avduob',
      {
        to_email: 'connect@sponsorstudio.in',
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        organization_type: formData.organization_type,
        message: formData.message,
      },
      'qZ4Yui6OPsXT6U99A'
    );

    // Send thank you email to user
    await emailjs.send(
      'service_f8hd0bm',
      'template_9i4r64k',
      {
        to_email: formData.email,
        name: formData.name,
      },
      'qZ4Yui6OPsXT6U99A'
    );

    toast.success('Message sent successfully!');
    return true;
  } catch (error) {
    toast.error('Failed to send message. Please try again.');
    return false;
  }
};

export const sendDemoRequestEmail = async (formData: {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyName: string;
  role: string;
  budget?: string;
  message: string;
}) => {
  const formattedMessage = `
--- New Demo Booking Request ---
Company Name: ${formData.companyName}
Contact Name: ${formData.name}
Job Title: ${formData.jobTitle}
Role: ${formData.role}
Annual Budget / Revenue: ${formData.budget || 'Not specified'}

Notes / Message:
${formData.message}
  `;

  return sendContactEmail({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    message: formattedMessage,
    organization_type: formData.role,
  });
};

/**
 * Notifies the team of a new subscriber to The Backdrop. Only the internal
 * notification is sent: the contact form's "thanks for getting in touch" email
 * would be the wrong message for a newsletter signup.
 */
export const sendNewsletterSignup = async (signup: { email: string; audience: 'brand' | 'organizer' }) => {
  const audience = signup.audience === 'brand' ? 'Brand' : 'Event organiser';
  await emailjs.send(
    'service_f8hd0bm',
    'template_5avduob',
    {
      to_email: 'connect@sponsorstudio.in',
      from_name: `The Backdrop subscriber (${audience})`,
      from_email: signup.email,
      phone: '',
      organization_type: audience,
      message: `New subscriber to The Backdrop.\nEmail: ${signup.email}\nAudience: ${audience}\nPerk: 500 free credits to be added to their account.`,
    },
    'qZ4Yui6OPsXT6U99A'
  );
};

/**
 * Sends a job application to the team through the contact template. Applicants
 * share a link to their CV rather than attaching a file.
 */
export const sendJobApplication = async (application: {
  role: string;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  note: string;
}) => {
  await emailjs.send(
    'service_f8hd0bm',
    'template_5avduob',
    {
      to_email: 'connect@sponsorstudio.in',
      from_name: application.name,
      from_email: application.email,
      phone: application.phone,
      organization_type: `Job application: ${application.role}`,
      message: `New application for ${application.role}.\n\nCV / portfolio: ${application.cvUrl}\n\n${application.note || 'No note added.'}`,
    },
    'qZ4Yui6OPsXT6U99A'
  );
};
