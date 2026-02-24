import React from 'react';
import { Check, Clock, ChefHat, Package, CheckCircle2 } from 'lucide-react';

const OrderStepper = ({ currentStatus }) => {
  const steps = [
    {
      status: 'PENDING',
      label: 'Order Placed',
      icon: Clock,
      description: 'Your order has been placed'
    },
    {
      status: 'PREPARING',
      label: 'Preparing',
      icon: ChefHat,
      description: 'Vendor is preparing your order'
    },
    {
      status: 'READY',
      label: 'Ready',
      icon: Package,
      description: 'Order is ready for pickup'
    },
    {
      status: 'DELIVERED',
      label: 'Delivered',
      icon: CheckCircle2,
      description: 'Order has been delivered'
    }
  ];

  const getStepIndex = (status) => {
    return steps.findIndex(step => step.status === status);
  };

  const currentStepIndex = getStepIndex(currentStatus);

  const isStepCompleted = (stepIndex) => stepIndex <= currentStepIndex;
  const isStepActive = (stepIndex) => stepIndex === currentStepIndex;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div
            className="h-full bg-brand-primary transition-all duration-500"
            style={{
              width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const completed = isStepCompleted(index);
          const active = isStepActive(index);

          return (
            <div key={step.status} className="flex flex-col items-center flex-1">
              {/* Icon Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  completed
                    ? 'bg-brand-primary text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                } ${active ? 'ring-4 ring-orange-200 scale-110' : ''}`}
              >
                {completed && !active ? (
                  <Check size={24} strokeWidth={3} />
                ) : (
                  <Icon size={24} />
                )}
              </div>

              {/* Label */}
              <div className="text-center">
                <p
                  className={`font-semibold text-sm mb-1 transition-colors ${
                    completed ? 'text-brand-primary' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block max-w-[100px]">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStepper;
