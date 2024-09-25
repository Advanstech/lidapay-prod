export const EmailTemplates = {
  welcomeEmail: (firstName: string) => `Dear ${firstName},
  
  Welcome to Lidapay! We're thrilled to have you join our community.
  
  Your account has been successfully created, and you're now ready to explore all the features and benefits our platform has to offer. 
  Whether you're looking to buy airtime or internet data, send money, pay bills, or manage your finances, Lidapay is here to make your financial transactions smooth and secure.
  
  Here are a few things you can do to get started:
  1. Complete your profile
  2. Verify your account for enhanced security
  3. Explore our range of services
  
  If you have any questions or need assistance, our support team is always here to help.
  
  Thank you for choosing Lidapay. We look forward to serving you!
  
  Best regards,
  The Lidapay Team,
  Advansis Technologies,
  P.O. Box 1234,
  Accra,
  Ghana.
  info@advansistechnologies.com.
  +233 24 456 7890
  `,
  emailVerificationSuccess: (firstName: string) => `
  Hello ${firstName}, your email has been verified!
  `, // New method

};