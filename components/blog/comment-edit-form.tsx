'use client';

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Database } from '@/types/database.types';

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

interface CommentEditFormProps {
  comment: Comment;
  onSave: (updatedComment: Comment) => void;
  onCancel: () => void;
}

/**
 * 댓글 인라인 수정 폼 컴포넌트
 * 댓글 내용을 직접 수정할 수 있는 텍스트 영역과 저장/취소 버튼을 제공합니다.
 * - ESC: 취소, Ctrl+Enter: 저장
 * - PUT /api/comments/[id]로 수정
 */
export default function CommentEditForm({ comment, onSave, onCancel }: CommentEditFormProps) {
  const [content, setContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 컴포넌트 마운트 시 텍스트 영역에 포커스
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // 커서를 텍스트 끝으로 이동
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, []);
  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC: 취소
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      // Ctrl+Enter: 저장
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]); // content 의존성 제거하여 불필요한 재등록 방지

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    if (!content.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return false;
    }
    if (content.trim().length < 5) {
      setError('댓글은 5글자 이상 입력해주세요.');
      return false;
    }
    if (content.trim().length > 1000) {
      setError('댓글은 1000글자 이하로 입력해주세요.');
      return false;
    }
    setError(null);
    return true;
  };
  // 댓글 저장 처리
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // 내용이 변경되지 않았으면 취소
    if (content.trim() === comment.content) {
      onCancel();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // PUT API 호출로 댓글 수정
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '댓글 수정에 실패했습니다.');
      }

      const { comment: updatedComment } = await response.json();
      
      // API 응답을 프론트엔드 타입으로 변환
      const convertedComment = convertCommentFromApi(updatedComment);
      
      // 부모 컴포넌트에 수정된 댓글 전달
      onSave(convertedComment);
      
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      setError(error instanceof Error ? error.message : '댓글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 처리
  const handleCancel = () => {
    // 내용을 원본으로 복원
    setContent(comment.content);
    setError(null);
    onCancel();
  };
  return (
    <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      {/* 편집 모드 표시 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-700">댓글 수정 중</span>
        <span className="text-xs text-blue-600">ESC: 취소, Ctrl+Enter: 저장</span>
      </div>

      {/* 텍스트 영역 */}
      <div>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력해주세요..."
          rows={4}
          className={`resize-none ${error ? 'border-red-500' : 'border-blue-300'} focus:border-blue-500`}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          {error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : (
            <p className="text-gray-500 text-sm">
              {content.length}/1000자
            </p>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="border-gray-300 hover:bg-gray-50"
        >
          취소
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSubmitting || !content.trim() || content.trim() === comment.content}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}