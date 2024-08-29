import React, { useContext } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './styles/PaymentPage.css';


const PaymentPage = () => {
  const { calculateTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const onApprove = (data, actions) => {
    return actions.order.capture().then(() => {
      clearCart();
      navigate('/profile', { state: { message: 'Paiement réussi !' } });
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PayPalScriptProvider options={{ "client-id": "AVtGuKEkm6vmqJpjIr4jXR72YNQnCx9PSncpNgJubyZgVrYvo_FQHN5hLKyBTS5doTwO2vdkVQKZ-qKe" }}>
      <div className="payment-page">
        <h2>Paiement</h2>
        <button onClick={handleBack} className="back-button">Retour</button> {/* Bouton Retour */}
        <div>
          <h3>Total à payer: {calculateTotal()}€</h3>
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: calculateTotal(),
                  },
                }],
              });
            }}
            onApprove={onApprove}
          />
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default PaymentPage;
