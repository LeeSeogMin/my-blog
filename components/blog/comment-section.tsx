'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { Database } from '@/types/database.types';
import CommentItem from './comment-item';

// 데이터베이스 기반 댓글 타입 정의
type Comment = Database['public']['Tables']['comments']['Row'];

// API 응답을 프론트엔드 타입으로 변환하는 함수
const convertCommentFromApi = (apiComment: any): Comment => {
  return {
    id: apiComment.id,
    content: apiComment.content,
    user_id: apiComment.user_id,
    user_name: apiComment.user_name,
    user_email: apiComment.user_email,
    post_id: apiComment.post_id,
    parent_id: apiComment.parent_id,
    created_at: apiComment.created_at,
    updated_at: apiComment.updated_at,
  };
};

interface CommentSectionProps {
  postId: string;
  postTitle?: string;
}

interface CommentFormProps {
  postId: string;
  onCommentAdded: (comment: Comment) => void;
}

interface CommentListProps {
  comments: Comment[];
  editingCommentId: string | null;
  onCommentUpdated: (updatedComment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onEditStart: (commentId: string) => void;
  onEditCancel: () => void;
}

/**
 * 댓글 작성 폼 컴포넌트
 */
function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!content.trim()) {
      newErrors.content = '댓글 내용을 입력해주세요.';
    } else if (content.trim().length < 5) {
      newErrors.content = '댓글은 5글자 이상 입력해주세요.';
    } else if (content.trim().length > 1000) {
      newErrors.content = '댓글은 1000글자 이하로 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      setErrors({ submit: '로그인이 필요합니다.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // API를 통해 댓글 작성
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '댓글 작성에 실패했습니다.');
      }      const { comment } = await response.json();
      
      // API 응답을 프론트엔드 타입으로 변환
      const convertedComment = convertCommentFromApi(comment);
      
      // 폼 초기화
      setContent('');
      setErrors({});
      
      // 부모 컴포넌트에 새 댓글 전달
      onCommentAdded(convertedComment);
      
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : '댓글 작성 중 오류가 발생했습니다.' 
      });    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          댓글 작성
        </h3>
      </CardHeader>
      <CardContent>
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* 현재 로그인한 사용자 정보 표시 */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={user?.imageUrl}
              alt={user?.fullName || '사용자'}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium">{user?.fullName || '익명'}</p>
              <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          {/* 댓글 내용 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              댓글 내용 <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="content"
              placeholder="댓글을 입력해주세요..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={errors.content ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.content ? (
                <p className="text-red-500 text-sm">{errors.content}</p>
              ) : (
                <p className="text-gray-500 text-sm">
                  {content.length}/1000자
                </p>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? '작성 중...' : '댓글 작성'}            </Button>
          </div>
        </form>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 댓글 목록 컴포넌트
 */
function CommentList({ 
  comments, 
  editingCommentId, 
  onCommentUpdated, 
  onCommentDeleted, 
  onEditStart, 
  onEditCancel 
}: CommentListProps) {
  const { user } = useUser();

  // 댓글 삭제 처리
  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '댓글 삭제에 실패했습니다.');
      }

      onCommentDeleted(commentId);
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      alert(error instanceof Error ? error.message : '댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 댓글이 없습니다</h3>
        <p className="text-gray-500">
          첫 번째 댓글을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment}
          onReply={(commentId) => {
            console.log('답글 작성:', commentId);
            // TODO: 답글 기능 구현
          }}
          onLike={(commentId) => {
            console.log('좋아요:', commentId);
            // TODO: 좋아요 기능 구현
          }}
          onReport={(commentId) => {
            console.log('신고:', commentId);
            // TODO: 신고 기능 구현
          }}          onEdit={onEditStart}
          onUpdate={onCommentUpdated}
          onDelete={handleCommentDelete}
          isEditing={editingCommentId === comment.id}
          onEditCancel={onEditCancel}
        />
      ))}
    </div>
  );
}

/**
 * 메인 댓글 섹션 컴포넌트
 */
export default function CommentSection({ postId, postTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // 댓글 로드 (API 호출)
  const loadComments = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      const response = await fetch(`/api/comments?postId=${postId}`);
      
      if (!response.ok) {
        throw new Error('댓글을 불러올 수 없습니다.');
      }

      const { comments: fetchedComments } = await response.json();
      
      // API 응답을 프론트엔드 타입으로 변환 및 최신순 정렬
      const convertedComments = fetchedComments
        .map(convertCommentFromApi)
        .sort((a: Comment, b: Comment) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      setComments(convertedComments);
    } catch (error) {
      console.error('댓글 로드 중 오류:', error);
      setLoadError(error instanceof Error ? error.message : '댓글을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 새 댓글 추가 처리
  const handleCommentAdded = (newComment: Comment) => {
    const convertedComment = convertCommentFromApi(newComment);
    setComments(prevComments => [convertedComment, ...prevComments]);
  };
  // 댓글 수정 처리
  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
    // 편집 모드 해제
    setEditingCommentId(null);
  };

  // 댓글 삭제 처리
  const handleCommentDeleted = (commentId: string) => {
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
    // 편집 중이던 댓글이 삭제된 경우 편집 모드 해제
    if (editingCommentId === commentId) {
      setEditingCommentId(null);
    }
  };

  // 편집 시작 처리
  const handleEditStart = (commentId: string) => {
    setEditingCommentId(commentId);
  };

  // 편집 취소 처리
  const handleEditCancel = () => {
    setEditingCommentId(null);
  };

  // 컴포넌트 마운트 시 댓글 로드
  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (loadError) {
    return (
      <div className="py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">댓글을 불러올 수 없습니다</h3>
          <p className="text-red-600 mb-4">{loadError}</p>
          <Button 
            onClick={loadComments}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">댓글</h2>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
          {comments.length}개
        </span>
      </div>

      {/* 댓글 작성 폼 */}
      <SignedIn>
        <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />
      </SignedIn>

      <SignedOut>
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                댓글을 작성하려면 로그인이 필요합니다
              </h3>
              <p className="text-gray-500 mb-4">
                로그인하고 다른 사용자들과 의견을 나눠보세요.
              </p>
              <SignInButton mode="modal">
                <Button variant="outline" size="lg">
                  로그인하기
                </Button>
              </SignInButton>
            </div>
          </CardContent>
        </Card>
      </SignedOut>      {/* 댓글 목록 */}
      <div>
        <CommentList 
          comments={comments} 
          editingCommentId={editingCommentId}
          onCommentUpdated={handleCommentUpdated}
          onCommentDeleted={handleCommentDeleted}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
        />
      </div>
    </section>
  );
}