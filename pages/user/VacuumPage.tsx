import React, { useState, useMemo } from 'react';
import { useData } from '../../data/DataContext';
import { useAuth } from '../../Auth';
import { VacuumPackage, Marinade, VacuumOrder, Address, PaymentMethod, VacuumOrderItem } from '../../types';
import Modal from '../../components/Modal';
import { CartIcon, DeleteIcon } from '../../components/icons/IconComponents';

interface CartItem extends VacuumOrderItem {
  id: string; 
}

const VacuumPackageCard: React.FC<{ pkg: VacuumPackage; onAddToCart: () => void; }> = ({ pkg, onAddToCart }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-row items-center border-2 border-gray-700 h-32">
        <img src={pkg.imageUrl} alt={pkg.name} className="w-32 h-full object-cover" />
        <div className="p-3 flex-grow flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-gray-900 text-sm">{pkg.name}</h3>
                <span className="text-sm font-semibold text-blue-600 text-base">(1 كيلو)</span>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold text-orange-600">{pkg.pricePerKg.toFixed(3)} د.ك</span>
                 <button
                    onClick={onAddToCart}
                    className="bg-orange-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    إضافة للسلة
                </button>
            </div>
        </div>
    </div>
);


const VacuumPage: React.FC = () => {
    const { user } = useAuth();
    const { vacuumPackages, marinades, addVacuumOrder } = useData();
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isMarinadeModalOpen, setIsMarinadeModalOpen] = useState(false);
    const [packageToAdd, setPackageToAdd] = useState<VacuumPackage | null>(null);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [showPaymentScreen, setShowPaymentScreen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const chickenPackages = vacuumPackages.filter(p => p.type === 'chicken');
    const beefPackages = vacuumPackages.filter(p => p.type === 'beef');

    const handleAddToCartClick = (pkg: VacuumPackage) => {
        setPackageToAdd(pkg);
        setQuantity(1);
        setIsMarinadeModalOpen(true);
    };
    
    const handleConfirmAddToCart = (marinade: Marinade) => {
        if (!packageToAdd || quantity <= 0) return;

        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(
                item => item.packageId === packageToAdd.id && item.marinadeId === marinade.id
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                const existingItem = newCart[existingItemIndex];
                if(existingItem){
                   existingItem.quantityKg += quantity;
                }
                return newCart;
            } else {
                const newItem: CartItem = {
                    id: `cart-item-${Date.now()}`,
                    packageId: packageToAdd.id,
                    marinadeId: marinade.id,
                    quantityKg: quantity,
                };
                return [...prevCart, newItem];
            }
        });
        
        setIsMarinadeModalOpen(false);
        setPackageToAdd(null);
    };
    
    const handleRemoveFromCart = (cartItemId: string) => {
        setCart(prev => prev.filter(item => item.id !== cartItemId));
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => {
            const pkg = vacuumPackages.find(p => p.id === item.packageId);
            return total + (pkg?.pricePerKg || 0) * item.quantityKg;
        }, 0);
    }, [cart, vacuumPackages]);

    const proceedToPayment = () => {
        if (!user || cart.length === 0) return;
        setIsCartModalOpen(false);
        setShowPaymentScreen(true);
    };

    const handleConfirmPayment = () => {
        if (!user || cart.length === 0) return;

        const orderDate = new Date();
        const deliveryDate = new Date();
        deliveryDate.setDate(orderDate.getDate() + 2);

        const newOrder: VacuumOrder = {
            id: `vo-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            orderDate: orderDate.toISOString().split('T')[0],
            deliveryDate: deliveryDate.toISOString().split('T')[0],
            items: cart.map(({ id, ...item }) => item),
            totalPrice: cartTotal,
            paymentMethod: 'knet',
            deliveryAddress: (user as any).address as Address,
            status: 'pending'
        };
        addVacuumOrder(newOrder);
        setShowPaymentScreen(false);
        setCart([]);
        setShowSuccessMessage(true);
    };

    const MarinadeSelectionModal = () => (
      <Modal isOpen={isMarinadeModalOpen} onClose={() => setIsMarinadeModalOpen(false)} title={`اختر تتبيلة وكمية لـ ${packageToAdd?.name}`}>
          <div className="mb-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">الكمية (بالكيلو)</label>
              <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 bg-gray-600 rounded-md">-</button>
                  <input 
                      type="number" 
                      id="quantity" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center bg-gray-900 border border-gray-500 rounded-md py-2 px-3 text-white"
                  />
                  <button type="button" onClick={() => setQuantity(q => q + 1)} className="px-3 py-1 bg-gray-600 rounded-md">+</button>
              </div>
          </div>
          <hr className="border-gray-600 my-4"/>
          <h4 className="font-semibold text-gray-200 mb-2">اختر التتبيلة</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {marinades.map(marinade => (
                  <button key={marinade.id} onClick={() => handleConfirmAddToCart(marinade)}
                      className="p-3 text-right rounded-lg border-2 transition-colors bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-orange-500"
                  >
                      <h4 className="font-semibold">{marinade.name}</h4>
                      <p className="text-xs mt-1 opacity-80">{marinade.description}</p>
                  </button>
              ))}
          </div>
      </Modal>
    );

    const CartModal = () => (
        <Modal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} title="سلة التسوق">
            <div className="space-y-4">
                {cart.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                      {cart.map(item => {
                          const pkg = vacuumPackages.find(p => p.id === item.packageId);
                          const marinade = marinades.find(m => m.id === item.marinadeId);
                          const itemTotal = (pkg?.pricePerKg || 0) * item.quantityKg;
                          return (
                              <div key={item.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                                  <div>
                                      <p className="font-semibold text-white">{pkg?.name}</p>
                                      <p className="text-sm text-gray-400">تتبيلة: {marinade?.name}</p>
                                       <p className="text-sm text-gray-300 mt-1">الكمية: <span className="font-mono">{item.quantityKg}</span> كيلو</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <p className="font-mono text-orange-400">{itemTotal.toFixed(3)} د.ك</p>
                                      <button onClick={() => handleRemoveFromCart(item.id)} className="text-red-400 hover:text-red-500">
                                          <DeleteIcon />
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-8">سلة التسوق فارغة.</p>
                )}
                
                {cart.length > 0 && (
                   <>
                     <hr className="border-gray-600"/>
                     <div className="flex justify-between items-center text-xl font-bold">
                         <span className="text-white">الإجمالي:</span>
                         <span className="text-orange-400">{cartTotal.toFixed(3)} د.ك</span>
                     </div>
                     <button
                        onClick={proceedToPayment}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                     >
                        إتمام الطلب
                     </button>
                   </>
                )}
            </div>
        </Modal>
    );
    
     const PaymentModal = () => (
        <Modal isOpen={showPaymentScreen} onClose={() => setShowPaymentScreen(false)} title="إتمام عملية الدفع">
            <div className="text-center text-white space-y-6">
                <div>
                    <p className="text-gray-400">المبلغ الإجمالي للدفع</p>
                    <p className="text-4xl font-bold text-orange-400 my-2">{cartTotal.toFixed(3)} د.ك</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold">اختر طريقة الدفع</h4>
                    <div className="mt-2 flex justify-center">
                        <button className="border-2 border-orange-500 rounded-lg p-3">
                            <img src="https://www.knet.com.kw/images/knet-logo-new.png" alt="KNET" className="h-8"/>
                        </button>
                    </div>
                </div>
                <button 
                    onClick={handleConfirmPayment} 
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                    ادفع الآن
                </button>
            </div>
        </Modal>
    );

    return (
        <div className="space-y-8 relative pb-20">
            {cart.length > 0 && (
                <button
                    onClick={() => setIsCartModalOpen(true)}
                    className="fixed bottom-24 md:bottom-10 right-4 z-40 bg-orange-500 text-white rounded-full shadow-lg flex items-center p-3 hover:bg-orange-600 transition-transform hover:scale-105"
                >
                    <CartIcon />
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                    </span>
                    <span className="mr-2 font-bold">{cartTotal.toFixed(3)} د.ك</span>
                </button>
            )}

            <h1 className="text-3xl font-bold text-white text-center">باقات الفاكيوم</h1>
            
            <div className="bg-gray-900/50 p-4 sm:p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-orange-400 mb-4">دجاج فاكيوم طازج مبهر</h2>
                <div className="space-y-4">
                    {chickenPackages.map(pkg => (
                        <VacuumPackageCard key={pkg.id} pkg={pkg} onAddToCart={() => handleAddToCartClick(pkg)} />
                    ))}
                </div>
            </div>

            <div className="bg-gray-900/50 p-4 sm:p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-orange-400 mb-4">لحم فاكيوم فاخر مبهر</h2>
                <div className="space-y-4">
                    {beefPackages.map(pkg => (
                        <VacuumPackageCard key={pkg.id} pkg={pkg} onAddToCart={() => handleAddToCartClick(pkg)} />
                    ))}
                </div>
            </div>

            <MarinadeSelectionModal />
            <CartModal />
            <PaymentModal />
            
            <Modal isOpen={showSuccessMessage} onClose={() => setShowSuccessMessage(false)} title="تم استلام طلبك بنجاح!">
                <div className="text-center text-white space-y-4">
                    <p>شكراً لك! سيتم تجهيز طلبك وتوصيله خلال 48 ساعة.</p>
                    <button onClick={() => setShowSuccessMessage(false)} className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600">
                        حسنًا
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default VacuumPage;