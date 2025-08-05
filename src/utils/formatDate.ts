import { parse, format } from 'date-fns';

export const formatDate = (date: string | null | undefined): string => {
  if (!date) {
    return 'N/A';
  }

  try {
    let parsedDate: Date;

    // Try parsing common date formats
    if (date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      // Handle mm/dd/yyyy (e.g., 08/04/2025)
      parsedDate = parse(date, 'MM/dd/yyyy', new Date());
    } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Handle yyyy-mm-dd (e.g., 2025-08-04)
      parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    } else if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
      // Handle dd-mm-yyyy (e.g., 04-08-2025)
      parsedDate = parse(date, 'dd-MM-yyyy', new Date());
    } else {
      // Fallback to native Date parsing for other formats
      parsedDate = new Date(date);
    }

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date';
    }

    // Format as dd/mm/yyyy
    const formatted = format(parsedDate, 'dd/MM/yyyy');
    return formatted;
  } catch (error) {
    return 'Error';
  }
};