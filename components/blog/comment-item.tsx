'use client';

import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CalendarDays, Heart, MessageSquare, Flag, Pencil, Trash2 } from 'lucide-react';
import { Database } from '@/types/database.types';
import CommentEditForm from './comment-edit-form';

// 데이터베이스 기반 댓글 타입 정의
type Comment = Database['public']['Tables']['comments']['Row'];

interface CommentItemProps {
  comment: Comment;
  isEditing?: boolean;
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onUpdate?: (updatedComment: Comment) => void;
  onEditCancel?: () => void;
}

/**
 * 개별 댓글 아이템 컴포넌트
 * 댓글의 모든 정보를 표시하고 기본적인 액션들을 제공합니다.
 */
export default function CommentItem({ 
  comment, 
  isEditing = false,
  onReply, 
  onLike, 
  onReport,
  onEdit,
  onDelete,
  onUpdate,
  onEditCancel 
}: CommentItemProps) {
  const { user } = useUser();
  const isAuthor = user?.id === comment.user_id;
  
  /**
   * 이니셜 생성 함수 (한글/영문 모두 지원)
   * @param name 작성자 이름
   * @returns 아바타에 표시할 이니셜
   */
  const getInitials = (name: string): string => {
    if (!name) return '?';
    
    // 한글인 경우 첫 글자만
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(name)) {
      return name.charAt(0);
    }
    
    // 영문인 경우 첫 글자들
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  /**
   * 아바타 배경색 생성 함수
   * 이름을 기반으로 일관된 색상을 생성합니다.
   * @param name 작성자 이름
   * @returns Tailwind CSS 배경색 클래스
   */
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600', 
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-teal-100 text-teal-600'
    ];
    
    // 이름의 문자 코드 합을 이용해 색상 선택
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  /**
   * 상대적 시간 포맷팅 함수
   * @param date 댓글 작성 시간
   * @returns 한국어 상대적 시간 문자열
   */
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);

    if (diffInMinutes < 1) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInDays < 7) {
      return `${diffInDays}일 전`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks}주 전`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths}개월 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  /**
   * 댓글 내용 렌더링 (줄바꿈 처리)
   * @param content 댓글 내용
   * @returns JSX 요소
   */
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };
  /**
   * 편집 시작 핸들러
   */
  const handleEdit = () => {
    onEdit?.(comment.id);
  };

  /**
   * 편집 취소 핸들러
   */
  const handleEditCancel = () => {
    onEditCancel?.();
  };

  /**
   * 편집 저장 핸들러
   */
  const handleEditSave = (updatedComment: Comment) => {
    onUpdate?.(updatedComment);
  };

  return (
    <div className="group border-b border-gray-100 pb-6 last:border-b-0 transition-all duration-200 hover:bg-gray-50/50 p-4 rounded-lg">
      <div className="flex gap-4">        {/* 아바타 */}
        <div className="shrink-0">
          <Avatar className="w-10 h-10">
            {/* Database에는 아바타 이미지 URL이 없으므로 이니셜만 표시 */}
            <AvatarFallback 
              className={`${getAvatarColor(comment.user_name || '익명')} text-sm font-semibold`}
            >
              {getInitials(comment.user_name || '익명')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* 댓글 콘텐츠 */}
        <div className="flex-1 min-w-0">          {/* 작성자 정보 헤더 */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="font-semibold text-gray-900">
              {comment.user_name || '익명'}
            </span>
            
            {/* 배지들 */}
            {isAuthor && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                내 댓글
              </span>
            )}
            
            {/* 작성 시간 */}
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatRelativeTime(new Date(comment.created_at))}
            </span>
          </div>          {/* 댓글 내용 또는 편집 폼 */}
          {isEditing ? (
            <CommentEditForm
              comment={comment}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
            />
          ) : (
            <div className="text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
              {renderContent(comment.content)}
            </div>
          )}          {/* 액션 버튼들 (편집 모드가 아닐 때만 표시) */}
          {!isEditing && (
            <div className="flex items-center gap-4">
            {/* 좋아요 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => onLike?.(comment.id)}
            >
              <Heart className="w-4 h-4 mr-1" />
              <span className="text-xs">좋아요</span>
            </Button>

            {/* 답글 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
              onClick={() => onReply?.(comment.id)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="text-xs">답글</span>
            </Button>

            {/* 작성자일 경우 편집/삭제 버튼 */}
            {isAuthor ? (
              <>                {/* 수정 버튼 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  onClick={handleEdit}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  <span className="text-xs">수정</span>
                </Button>

                {/* 삭제 버튼 (다이얼로그) */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="text-xs">삭제</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => onDelete?.(comment.id)}
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              /* 다른 사용자의 댓글일 경우 신고 버튼 */
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors opacity-0 group-hover:opacity-100"
                onClick={() => onReport?.(comment.id)}
              >
                <Flag className="w-4 h-4 mr-1" />                <span className="text-xs">신고</span>
              </Button>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 