import React from 'react';
import './styles/ContactPage.css';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="contact-page">
        <Link to="/" className="back-link">Retour à l'accueil</Link>
      <h1>Contactez-nous</h1>
      <div className="contact-section">
        <h2>Nous contacter par mail</h2>
        <p>support@gmail.com</p>
      </div>
      <div className="contact-section">
        <h2>Méthodes de paiement acceptées</h2>
        <p>Visa, PayPal</p>
      </div>
      <div className="contact-section">
        <h2>Nos délais de livraison</h2>
        <p>Mondial Relay : 3-5 jours</p>
      </div>
      <div className="contact-section">
        <h2>Problème de livraison</h2>
        <p>Vous n'avez pas reçu votre colis ? Contactez-nous par mail à support@gmail.com</p>
      </div>
      <div className="contact-section">
        <h2>Newsletter</h2>
        <p>
          Vous souhaitez recevoir les newsletters par mail ? <br />
          <a href="#" className="newsletter-link">Cliquez ici et remplissez le formulaire</a>
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
