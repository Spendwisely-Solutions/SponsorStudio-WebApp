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
