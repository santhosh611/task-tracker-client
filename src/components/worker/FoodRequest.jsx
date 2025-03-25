// src/components/worker/FoodRequest.jsx
import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { submitFoodRequest, getFoodRequestSettings } from '../../services/foodRequestService';
import Button from '../common/Button';
import Card from '../common/Card';
import Spinner from '../common/Spinner';

const FoodRequest = () => {
 const { user } = useContext(AuthContext); // Use useContext directly
 const [loading, setLoading] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [enabled, setEnabled] = useState(true);
 const [submittedTime, setSubmittedTime] = useState(null);

 useEffect(() => {
   // Check if worker has already submitted a request today
   const checkSubmissionStatus = async () => {
     try {
       if (user) {
         // Use worker-specific storage key with user ID
         const storageKey = `foodRequestSubmitted_${user._id}`;
         const storedData = localStorage.getItem(storageKey);
         
         if (storedData) {
           const { date, time } = JSON.parse(storedData);
           const today = new Date().toDateString();
           
           if (date === today) {
             setSubmitted(true);
             setSubmittedTime(time);
           } else {
             // Clear old submission data
             localStorage.removeItem(storageKey);
           }
         }
         
         // Check if food request feature is enabled
         const settings = await getFoodRequestSettings();
         setEnabled(settings.enabled);
       }
     } catch (error) {
       console.error('Error checking food request status:', error);
       toast.error('Failed to load food request status');
     }
   };
   
   if (user) {
     checkSubmissionStatus();
   }
 }, [user]); // Add user as dependency

 const handleSubmit = async () => {
   setLoading(true);
   try {
     await submitFoodRequest();
     
     const now = new Date();
     const timeString = now.toLocaleTimeString();
     
     // Store submission in localStorage for today with user-specific key
     const storageKey = `foodRequestSubmitted_${user._id}`;
     localStorage.setItem(storageKey, JSON.stringify({
       date: now.toDateString(),
       time: timeString
     }));
     
     setSubmitted(true);
     setSubmittedTime(timeString);
     toast.success('Food request submitted successfully!');
   } catch (error) {
     toast.error(error.message || 'Failed to submit food request');
   } finally {
     setLoading(false);
   }
 };

 return (
   <Card className="max-w-lg mx-auto">
     <h2 className="text-xl font-bold mb-4">Food Request</h2>
     
     {!enabled && (
       <div className="mb-4 p-3 bg-orange-100 text-orange-800 rounded-md">
         Food requests are currently disabled by admin.
       </div>
     )}
     
     {submitted ? (
       <div className="text-center p-4">
         <div className="text-green-600 mb-2">✓ You have successfully requested food today</div>
         {submittedTime && (
           <div className="text-gray-600">Submitted at: {submittedTime}</div>
         )}
         <p className="mt-4">You can proceed to the cafeteria to get your meal.</p>
       </div>
     ) : (
       <div className="text-center">
         <p className="mb-4">Submit your food request for today:</p>
         <Button 
           onClick={handleSubmit} 
           disabled={loading || !enabled}
           variant="primary"
           className="w-full"
         >
           {loading ? <Spinner size="sm" /> : 'Request Food'}
         </Button>
       </div>
     )}
   </Card>
 );
};

export default FoodRequest;