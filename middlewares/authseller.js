import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Store from '@/lib/models/Store';

const authSeller = async (userId) => {
    try {
        await dbConnect(); // Connect to MongoDB

        // Find user by ID
        const user = await User.findById(userId);

        if (!user) {
            return false;
        }

        // Find the user's store
        const store = await Store.findOne({ userId: userId });

        if (store) {
            if (store.status === 'approved') {
                return store._id.toString(); 
            } else {
                return false;
            }
        } else {
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

export default authSeller;
