
import { useBooking } from "@/contexts/BookingContext";
import RideSummary from "@/components/RideSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extras } from "@/data/mockData";
import ExtraOptionItem from "@/components/ExtraOptionItem";
import { ChevronRight } from "lucide-react";

const ExtrasSelection = () => {
  const { nextStep, prevStep } = useBooking();

  return (
    <div>
      <h2 className="text-2xl font-normal mb-6">Extra Options</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Flight/Train Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Flight/train number</label>
              <Input
                placeholder="Example : LH83822"
                className="w-full p-3"
              />
            </div>

            {/* Extra Options */}
            <div className="bg-white border rounded-lg overflow-hidden">
              {extras.slice(0, 4).map((extra) => (
                <ExtraOptionItem key={extra.id} extra={extra} />
              ))}
            </div>

            {/* Services with Select Buttons */}
            {extras.slice(4).map((extra) => (
              <div key={extra.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-normal flex items-center">
                    {extra.name}
                    <span className="ml-2 px-2 py-1 bg-[#ED1B24] text-white rounded-md text-sm">
                      ${extra.price}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{extra.description}</p>
                </div>
                <Button variant="outline" className="border-[#ED1B24] text-[#ED1B24] hover:bg-red-50">
                  Select <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            ))}

            {/* Notes for chauffeur */}
            <div className="mt-8">
              <h4 className="mb-2 font-normal">Notes for the chauffeur</h4>
              <Textarea
                placeholder="There are many variations of passages of Lorem Ipsum available."
                className="w-full h-32 p-3"
              />
            </div>

            {/* Continue Button */}
            <div className="mt-6">
              <Button 
                onClick={nextStep} 
                className="bg-[#111111] hover:bg-gray-800 text-white px-8 py-6 text-lg w-full md:w-auto font-normal"
              >
                Continue <ChevronRight size={18} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <RideSummary />
        </div>
      </div>
    </div>
  );
};

export default ExtrasSelection;
