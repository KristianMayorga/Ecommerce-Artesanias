import {useState} from "react";
import {MessageSquare} from "lucide-react";
import {Comment} from "@/app/components/custom-order/types";

const OrderComments = ({
                           comments,
                           orderId,
                           onAddComment,
                       }: {
    comments?: Comment[],
    orderId: number,
    onAddComment: (orderId: number, comment: string) => void
}) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = () => {
        if (!newComment.trim()) return;
        onAddComment(orderId, newComment);
        setNewComment('');
    };

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comentarios
            </h3>
            <div className="space-y-2">
                {comments?.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{comment.author}</span>
                            <span>{new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                    </div>
                ))}
                <div className="flex gap-2 mt-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Agregar un comentario..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                    />
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderComments;