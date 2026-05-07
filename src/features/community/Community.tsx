import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Heart, Share2, Plus, 
  MoreHorizontal, Image as ImageIcon, Send, 
  TrendingUp, TrendingDown, User, Loader2,
  CornerDownRight, Edit2, Trash2, X
} from "lucide-react";
import { useCommunity } from "./CommunityContext";
import { useAuth } from "../auth/AuthContext";
import { formatCurrency } from "@/src/lib/utils";
import { Post, TradeComment } from "@/src/types";

function CommentSection({ postId, commentsCount }: { postId: string, commentsCount: number }) {
  const { getComments, addComment } = useCommunity();
  const { profile } = useAuth();
  const [comments, setComments] = React.useState<TradeComment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(postId, newComment);
      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50/50 border-t border-slate-100 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 dark:bg-gray-900/50 dark:border-gray-800">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:bg-gray-800 dark:border-gray-800">
                <User className="h-4 w-4 text-slate-400 dark:text-gray-500" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{comment.userName}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-gray-500">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed dark:text-gray-400">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 text-center py-2 dark:text-gray-500">No comments yet. Be the first to reply!</p>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:bg-gray-800 dark:border-gray-800">
          {profile?.photoURL ? (
            <img src={profile.photoURL} alt={profile.fullName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User className="h-4 w-4 text-slate-400 dark:text-gray-500" />
          )}
        </div>
        <div className="flex-1 flex items-center space-x-2 bg-slate-100/50 rounded-lg px-3 py-1.5 border border-slate-200 focus-within:border-blue-500/50 transition-colors dark:bg-gray-800/50 dark:border-gray-700">
          <input 
            type="text" 
            placeholder="Write a reply..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-slate-900 placeholder:text-slate-400 dark:text-white dark:placeholder:text-gray-500"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-blue-500 hover:text-blue-400 disabled:opacity-50"
            onClick={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

const PostItem = React.memo(({ post, profile, currencyCode, toggleLike, updatePost, deletePost, toggleComments, isExpanded }: { 
  post: Post, 
  profile: any, 
  currencyCode: string, 
  toggleLike: (id: string) => void,
  updatePost: (id: string, content: string) => void,
  deletePost: (id: string) => void,
  toggleComments: (id: string) => void,
  isExpanded: boolean
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(post.content);
  const [showMenu, setShowMenu] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const isOwner = profile?.uid === post.userId;
  const isDemo = post.id.startsWith('demo-');

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    await updatePost(post.id, editContent);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(post.id);
    }
  };

  return (
    <>
      <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <CardHeader className="flex flex-row items-center space-x-4 pb-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:bg-gray-800 dark:border-gray-800">
            {post.userPhoto && !isDemo ? (
              <img 
                src={post.userPhoto} 
                alt={post.userName} 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-500/10 text-blue-500 font-bold text-sm">
                {post.userName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{post.userName}</h3>
              {isOwner && (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  >
                    <MoreHorizontal className="h-4 w-4 text-slate-400 dark:text-gray-500" />
                  </Button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10 py-1 dark:bg-gray-900 dark:border-gray-800">
                      <button 
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg-gray-800 flex items-center"
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                      >
                        <Edit2 className="h-3 w-3 mr-2" /> Edit
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center"
                        onClick={(e) => { e.stopPropagation(); handleDelete(); setShowMenu(false); }}
                      >
                        <Trash2 className="h-3 w-3 mr-2" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest dark:text-gray-500">
              {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </CardHeader>
        <div className="cursor-pointer" onClick={() => setIsDetailOpen(true)}>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <textarea 
                  className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleUpdate}>Save</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed dark:text-gray-300">{post.content}</p>
            )}
            
            {post.trade && (
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    post.trade.status === 'Win' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {post.trade.direction === 'Long' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{post.trade.symbol}</p>
                    <p className="text-[10px] text-slate-400 uppercase dark:text-gray-500">{post.trade.direction}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-xs font-bold",
                    post.trade.status === 'Win' ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                  )}>
                    {formatCurrency(post.trade.netPL, currencyCode, true)}
                  </p>
                  <Badge variant={post.trade.status === 'Win' ? 'success' : 'danger'} className="text-[8px] px-1.5 py-0">
                    {post.trade.status}
                  </Badge>
                </div>
              </div>
            )}

            {post.imageURL && (
              <img 
                src={post.imageURL} 
                alt="Post content" 
                className="rounded-xl border border-slate-100 w-full object-cover max-h-[300px] dark:border-gray-800"
                referrerPolicy="no-referrer"
              />
            )}
          </CardContent>
        </div>
        <CardFooter className="border-t border-slate-100 flex items-center justify-around py-2 dark:border-gray-800">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex-1 text-slate-400 hover:text-red-500 dark:text-gray-400", profile && post.likes.includes(profile.uid) && "text-red-500")}
            onClick={() => toggleLike(post.id)}
          >
            <Heart className={cn("mr-2 h-4 w-4", profile && post.likes.includes(profile.uid) && "fill-current")} />
            {post.likes.length}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex-1 text-slate-400 hover:text-blue-500 dark:text-gray-400", isExpanded && "text-blue-500")}
            onClick={() => toggleComments(post.id)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {post.commentsCount || 0}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-slate-400 hover:text-emerald-500 dark:text-gray-400">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </CardFooter>
        {isExpanded && (
          <CommentSection postId={post.id} commentsCount={post.commentsCount || 0} />
        )}
      </Card>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-gray-800">
                <h3 className="font-bold text-slate-900 dark:text-white">Post Details</h3>
                <div className="flex items-center space-x-2">
                  {isOwner && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => { setIsEditing(true); setIsDetailOpen(false); }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { handleDelete(); setIsDetailOpen(false); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsDetailOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:bg-gray-800 dark:border-gray-800">
                    {post.userPhoto && !isDemo ? (
                      <img src={post.userPhoto} alt={post.userName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-blue-500/10 text-blue-500 font-bold text-lg">
                        {post.userName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{post.userName}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest dark:text-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-base text-slate-600 leading-relaxed dark:text-gray-300">{post.content}</p>

                {post.trade && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          post.trade.status === 'Win' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                          {post.trade.direction === 'Long' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{post.trade.symbol}</p>
                          <p className="text-xs text-slate-400 uppercase dark:text-gray-500">{post.trade.direction}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          post.trade.status === 'Win' ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                        )}>
                          {formatCurrency(post.trade.netPL, currencyCode, true)}
                        </p>
                        <Badge variant={post.trade.status === 'Win' ? 'success' : 'danger'}>
                          {post.trade.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {post.imageURL && (
                  <img 
                    src={post.imageURL} 
                    alt="Post content" 
                    className="rounded-2xl border border-slate-100 w-full object-contain max-h-[500px] dark:border-gray-800"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div className="pt-6 border-t border-slate-100 dark:border-gray-800">
                  <h4 className="font-bold text-sm mb-4 flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments ({post.commentsCount || 0})
                  </h4>
                  <CommentSection postId={post.id} commentsCount={post.commentsCount || 0} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

export function Community() {
  const { posts, loading, hasMore, loadMore, addPost, updatePost, deletePost, toggleLike } = useCommunity();
  const { profile } = useAuth();
  const currencyCode = profile?.currency || 'USD';
  const [newPost, setNewPost] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [expandedComments, setExpandedComments] = React.useState<Record<string, boolean>>({});

  const toggleComments = React.useCallback((postId: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setIsSubmitting(true);
    try {
      await addPost(newPost);
      setNewPost("");
    } catch (err) {
      console.error("Failed to add post:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">Community</h1>
      </div>

      {/* Create Post */}
      <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-500/20 dark:bg-blue-500/5">
        <CardContent className="pt-4">
          <div className="flex space-x-4">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden dark:bg-gray-800">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.fullName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="h-6 w-6 text-slate-400 dark:text-gray-500" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea 
                placeholder="Share a trade, thought, or mood..." 
                className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-900 resize-none min-h-[80px] dark:text-white"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-gray-800">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </Button>
                </div>
                <Button size="sm" disabled={!newPost.trim() || isSubmitting} onClick={handlePost}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostItem 
            key={post.id} 
            post={post} 
            profile={profile} 
            currencyCode={currencyCode}
            toggleLike={toggleLike}
            updatePost={updatePost}
            deletePost={deletePost}
            toggleComments={toggleComments}
            isExpanded={!!expandedComments[post.id]}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loading}
            className="w-full md:w-auto min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
