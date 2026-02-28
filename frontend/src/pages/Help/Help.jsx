// src/pages/Help/Help.jsx
import React from 'react';
import './Help.css';

const Help = () => {
  const faqs = [
    {
      question: 'How do I create a new flock?',
      answer: 'Go to the Flocks page and click the "Add New Flock" button. Fill in the required information about your poultry flock.'
    },
    {
      question: 'How does the AI recommendation work?',
      answer: 'Our AI analyzes your flock data, local ingredient prices, and nutritional requirements to generate optimal feed formulations.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export flock data, recommendations, and reports in PDF, Excel, or CSV formats from the respective pages.'
    },
    {
      question: 'How often should I update flock information?',
      answer: 'We recommend updating flock weight and age weekly for accurate feed recommendations.'
    }
  ];

  return (
    <div className="help">
      <div className="help-header">
        <h1>Help & Support Center</h1>
        <p>Find answers to common questions or contact our support team.</p>
      </div>

      <div className="help-content">
        <div className="quick-actions">
          <div className="action-card">
            <h3> Documentation</h3>
            <p>Complete user guides and tutorials</p>
            <button className="action-btn">View Docs</button>
          </div>
          <div className="action-card">
            <h3> Video Tutorials</h3>
            <p>Step-by-step video guides</p>
            <button className="action-btn">Watch Videos</button>
          </div>
          <div className="action-card">
            <h3> Contact Support</h3>
            <p>Get help from our expert team</p>
            <button className="action-btn">Contact Us</button>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-section">
          <h2>Need More Help?</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <h3> Email Support</h3>
              <p>support@poultryfeedai.com</p>
              <p>Response time: 24 hours</p>
            </div>
            <div className="contact-method">
              <h3> Live Chat</h3>
              <p>Available Monday-Friday, 9AM-5PM</p>
              <button className="chat-btn">Start Chat</button>
            </div>
            <div className="contact-method">
              <h3> Phone Support</h3>
              <p>+256 700 123 456</p>
              <p>Available 24/7 for emergencies</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
