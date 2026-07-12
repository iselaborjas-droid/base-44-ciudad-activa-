import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Share2, Plus, Send, Image, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Post.list('-created_date', 30);
      setPosts(data);
      setLoading(false);
    }
    load();
  }, []);

  const handlePublish = async () => {
    if (!newPost.trim()) return;
    setPublishing(true);
    const post = await base44.entities.Post.create({
      content: newPost,
      author_name: 'Usuario',
    });
    setPosts([post, ...posts]);
    setNewPost('');
    setShowCompose(false);
    setPublishing(false);
    toast({ title: '¡Publicación creada!' });
  };

  const handleLike = async (post) => {
    const updated = await base44.entities.Post.update(post.id, {
      likes_count: (post.likes_count || 0) + 1,
    });
    setPosts(posts.map(p => p.id === post.id ? updated : p));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comunidad</h1>
          <p className="text-sm text-muted-foreground mt-1">Comparte y conecta con tu comunidad</p>
        </div>
        <Button
          onClick={() => setShowCompose(!showCompose)}
          className="rounded-xl bg-ciudad-blue hover:bg-[#0E254A] text-white gap-2 h-10"
        >
          <Plus className="w-4 h-4" /> Publicar
        </Button>
      </div>

      {showCompose && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <Textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="¿Qué quieres compartir con la comunidad?"
            rows={3}
            className="rounded-xl border-0 bg-secondary resize-none text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCompose(false)} className="rounded-xl text-sm">
              Cancelar
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishing || !newPost.trim()}
              className="rounded-xl bg-ciudad-blue hover:bg-[#0E254A] text-white text-sm gap-2"
            >
              <Send className="w-4 h-4" /> {publishing ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-muted border-t-ciudad-blue rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Sé el primero en publicar</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-ciudad-blue-light text-ciudad-blue text-sm font-semibold">
                    {(post.author_name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{post.author_name}</p>
                  <p className="text-xs text-muted-foreground">{moment(post.created_date).fromNow()}</p>
                </div>
              </div>

              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{post.content}</p>

              {post.image_url && (
                <img src={post.image_url} alt="" className="w-full rounded-xl mt-3 object-cover max-h-80" />
              )}

              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-border">
                <button
                  onClick={() => handleLike(post)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Heart className="w-4 h-4" /> {post.likes_count || 0}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ciudad-blue transition-colors">
                  <MessageCircle className="w-4 h-4" /> {post.comments_count || 0}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-ciudad-green transition-colors">
                  <Share2 className="w-4 h-4" /> {post.shares_count || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}