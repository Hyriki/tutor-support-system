export const sendNotification = (recipientRole, message) => {
    try {
        const existingNotifications = JSON.parse(localStorage.getItem('system_notifications')) || [];
        
        const newNotification = {
            id: Date.now(),
            toRole: recipientRole,
            message: message,
            isRead: false,
            time: new Date().toLocaleString(),
        };

        const updatedNotifications = [...existingNotifications, newNotification];
        
        localStorage.setItem('system_notifications', JSON.stringify(updatedNotifications));
        
        console.log('Notification sent:', newNotification);

    } catch (error) {
        console.error("Failed to send notification:", error);
    }
};
