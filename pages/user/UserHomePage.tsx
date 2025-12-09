import React, { useState, useEffect } from 'react';
import { useData } from '../../data/DataContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { User } from '../../types';
import { WhatsAppIcon } from '../../components/icons/IconComponents';

const UserHomePage: React.FC = () => {
    const { user } = useAuth();
    const { packages, bannerImages, whatsAppNumber } = useData();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const isSubscribed = user && (user as User).subscription;

    useEffect(() => {
        if (bannerImages.length > 0) {
            const timer = setTimeout(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
            }, 2000); // Change image every 2 seconds
            return () => clearTimeout(timer);
        }
    }, [currentImageIndex, bannerImages]);
    
    return (
        <div className="space-y-8">
            <div className="
                relative w-full h-40 
                rounded-xl overflow-hidden shadow-lg 
                border-t-4 border-x-4 border-black
                border-b-8 border-orange-700"
            >
                {bannerImages.map((imageUrl, index) => (
                     <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}>
                        <img src={imageUrl} alt={`Banner image ${index + 1}`} className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    </div>
                ))}
            </div>
            
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">اكتشف باقاتنا</h2>
                     <a 
                        href={`https://wa.me/${whatsAppNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
                    >
                         <WhatsAppIcon className="w-6 h-6" />
                    </a>
                </div>
                <div className="space-y-4">
                    {packages.map(pkg => (
                        <Link
                            key={pkg.id}
                            to={isSubscribed ? '/user/my-meals' : `/user/subscribe/${pkg.id}`}
                            className="
                                block
                                bg-white 
                                rounded-lg 
                                shadow-md 
                                overflow-hidden 
                                flex 
                                transform 
                                hover:-translate-y-1 
                                transition-transform 
                                duration-300
                                border-2 border-gray-700 hover:border-orange-500 hover:border-4
                                relative
                            "
                        >
                            <img
                                src={`https://picsum.photos/300/300?random=${pkg.id}`}
                                alt={pkg.name}
                                className="w-32 h-32 object-cover flex-shrink-0"
                            />
                            <div className="p-4 flex flex-col justify-center">
                                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                                <div className="mt-3">
                                    <span className="text-orange-600 font-semibold text-sm">
                                        {isSubscribed ? 'اختر وجباتك' : 'اشترك الآن'} &rarr;
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserHomePage;