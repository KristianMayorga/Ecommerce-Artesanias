import { notFound } from 'next/navigation';
import Invoice from '@/app/components/Invoice';

const isValidObjectId = (id: string) => {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
};

export default function InvoicePage({ params }: { params: { id: string } }) {
    if (!isValidObjectId(params.id)) {
        notFound();
    }   

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Invoice transactionId={params.id} />
        </div>
    );
}