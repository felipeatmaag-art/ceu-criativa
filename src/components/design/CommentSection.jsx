import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Heart, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function CommentSection({ designId }) {
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', designId],
    queryFn: () => base44.entities.Comment.filter({ design_id: designId }, '-created_date', 50),
    enabled: !!designId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      return base44.entities.Comment.create(commentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', designId] });
      setNewComment('');
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim() || !user) return;

    createCommentMutation.mutate({
      design_id: designId,
      user_email: user.email,
      user_name: user.artist_name || user.full_name,
      user_avatar: user.avatar_url || '',
      comment: newComment,
      likes: 0
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">
        Comentários ({comments.length})
      </h3>

      {/* Comment Input */}
      {user ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full ceu-gradient flex items-center justify-center shrink-0">
              <span className="text-white font-medium">
                {user.artist_name?.charAt(0) || user.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Deixe seu comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-24 rounded-xl resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="rounded-xl ceu-gradient text-white"
                >
                  {createCommentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Comentar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-purple-50 rounded-2xl p-6 text-center">
          <p className="text-gray-600 mb-4">Faça login para comentar</p>
          <Button 
            onClick={() => base44.auth.redirectToLogin()}
            className="rounded-xl ceu-gradient text-white"
          >
            Entrar
          </Button>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border animate-pulse">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full ceu-gradient flex items-center justify-center shrink-0">
                    {comment.user_avatar ? (
                      <img src={comment.user_avatar} alt={comment.user_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-medium">
                        {comment.user_name?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{comment.user_name}</h4>
                      <span className="text-xs text-gray-500">
                        {moment(comment.created_date).fromNow()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.comment}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm">
                        <Heart className="w-4 h-4" />
                        <span>{comment.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro!</p>
        </div>
      )}
    </div>
  );
}