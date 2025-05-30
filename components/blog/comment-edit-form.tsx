import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Comment } from '@/types/comment';

interface CommentEditFormProps {
  comment: Comment;
  onSaveEdit: (content: string) => void;
  onCancelEdit: () => void;
}

/**
 * 댓글 인라인 수정 폼 컴포넌트
 * - ESC: 취소, Ctrl+Enter: 저장
 * - PUT /api/comments/[id]로 수정
 */
export default function CommentEditForm({ comment, onSaveEdit, onCancelEdit }: CommentEditFormProps) {
  const [value, setValue] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ESC/CTRL+Enter 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancelEdit();
      } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line
  }, [value]);

  // 저장 처리
  const handleSave = async () => {
    if (!value.trim()) {
      setError('댓글 내용을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '댓글 수정 중 오류가 발생했습니다.');
        setIsLoading(false);
        return;
      }
      onSaveEdit(data.comment.content);
    } catch (err) {
      setError('댓글 수정 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={4}
        disabled={isLoading}
        className={error ? 'border-red-500' : ''}
        autoFocus
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancelEdit} disabled={isLoading}>
          취소
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </Button>
      </div>
      <div className="text-xs text-gray-400 text-right">ESC: 취소, Ctrl+Enter: 저장</div>
    </div>
  );
} 