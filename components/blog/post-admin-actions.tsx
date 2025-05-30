'use client';

/**
 * 게시물 관리자 액션 컴포넌트
 * 작성자 본인에게만 표시되는 수정/삭제 버튼
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PostAdminActionsProps {
  postId: string;
  postSlug: string;
}

export default function PostAdminActions({ postId, postSlug }: PostAdminActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // 게시물 수정 페이지로 이동
  const handleEdit = () => {
    router.push(`/admin/posts/${postId}/edit`);
  };

  // 게시물 삭제 처리
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      console.log('=== 게시물 삭제 요청 ===', postId);
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '삭제에 실패했습니다');
      }

      console.log('✅ 게시물 삭제 성공');
      toast.success('게시물이 성공적으로 삭제되었습니다');
      
      // 게시물 목록으로 이동
      router.push('/posts');
      router.refresh(); // 페이지 새로고침으로 목록 업데이트
      
    } catch (error) {
      console.error('게시물 삭제 오류:', error);
      toast.error(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      {/* 관리자 안내 메시지 */}
      <div className="flex-1">
        <p className="text-sm text-amber-800 font-medium">
          👨‍💼 작성자 전용 메뉴
        </p>
        <p className="text-xs text-amber-600">
          이 버튼들은 작성자 본인에게만 보입니다.
        </p>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 수정 버튼 */}
        <Button
          onClick={handleEdit}
          size="sm"
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
        >
          <Edit className="w-4 h-4 mr-1" />
          수정
        </Button>

        {/* 삭제 버튼 */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              disabled={isDeleting}
              className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              삭제
            </Button>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>게시물 삭제 확인</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 게시물을 삭제하시겠습니까?
                <br />
                <strong>이 작업은 되돌릴 수 없습니다.</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  '삭제'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
} 