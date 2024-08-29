import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

function ProtectedComponent() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/admin-only-route');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching the data', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {data ? (
                <div>{data}</div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
}

export default ProtectedComponent;