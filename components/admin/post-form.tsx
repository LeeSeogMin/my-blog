/**
 * 관리자용 게시물 작성/수정 폼 컴포넌트
 * ImageUpload 컴포넌트와 통합된 완전한 게시물 관리 폼
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, FileText, Image as ImageIcon, Tag, Type } from 'lucide-react';
import ImageUpload from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ========================================
// 타입 정의
// ========================================

/**
 * 게시물 폼 데이터 타입
 */
export interface PostFormData {
  title: string;
  content: string;
  slug: string;
  coverImageUrl?: string;
  categoryId?: string;
}

/**
 * 카테고리 타입
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
}

/**
 * PostForm 컴포넌트 Props
 */
interface PostFormProps {
  /** 초기 게시물 데이터 (수정 시 사용) */
  initialData?: Partial<PostFormData>;
  /** 사용 가능한 카테고리 목록 */
  categories?: Category[];
  /** 폼 제출 핸들러 */
  onSubmit: (data: PostFormData) => void;
  /** 취소 핸들러 */
  onCancel: () => void;
  /** 제출 중 상태 */
  isSubmitting?: boolean;
  /** 수정 모드 여부 */
  isEditing?: boolean;
}

// ========================================
// 유틸리티 함수
// ========================================

/**
 * 제목에서 안전한 slug 생성 함수
 * 한글 지원, 특수문자 제거, 하이픈 정규화
 * 
 * @param title - 원본 제목
 * @returns 생성된 slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s\-]/g, '') // 안전한 문자만 허용 (하이픈 이스케이프)
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/-+/g, '-') // 연속 하이픈 제거
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
    .substring(0, 100); // 길이 제한
}

/**
 * 폼 데이터 검증 함수
 * 
 * @param data - 검증할 폼 데이터
 * @returns 검증 결과와 에러 메시지
 */
function validateFormData(data: PostFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push('제목을 입력해주세요.');
  }

  if (!data.content.trim()) {
    errors.push('내용을 입력해주세요.');
  }

  if (!data.slug.trim()) {
    errors.push('슬러그가 생성되지 않았습니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ========================================
// 메인 컴포넌트
// ========================================

/**
 * 게시물 작성/수정 폼 컴포넌트
 * 
 * @param props - PostFormProps
 * @returns JSX.Element
 */
export default function PostForm({
  initialData = {},
  categories = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false
}: PostFormProps) {
  // ========================================
  // 상태 관리
  // ========================================

  const [formData, setFormData] = useState<PostFormData>({
    title: initialData.title || '',
    content: initialData.content || '',
    slug: initialData.slug || '',
    coverImageUrl: initialData.coverImageUrl || '',
    categoryId: initialData.categoryId || ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // ========================================
  // 초기 데이터 설정
  // ========================================

  useEffect(() => {
    // 초기 데이터가 있고 slug가 있으면 수동 편집된 것으로 간주
    if (initialData.slug) {
      setIsSlugManuallyEdited(true);
    }
  }, [initialData.slug]);

  // ========================================
  // 이벤트 핸들러
  // ========================================

  /**
   * 제목 변경 핸들러
   * 제목 변경 시 자동으로 slug 생성 (수동 편집되지 않은 경우)
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      title: newTitle,
      // slug가 수동으로 편집되지 않은 경우에만 자동 생성
      slug: isSlugManuallyEdited ? prev.slug : generateSlug(newTitle)
    }));

    // 에러 초기화
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * slug 변경 핸들러
   * 사용자가 직접 slug를 편집하는 경우
   */
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    
    setFormData(prev => ({
      ...prev,
      slug: newSlug
    }));

    // slug가 수동으로 편집되었음을 표시
    setIsSlugManuallyEdited(true);

    // 에러 초기화
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * 내용 변경 핸들러
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value
    }));

    // 에러 초기화
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * 카테고리 변경 핸들러
   * "none" 값을 빈 문자열로 변환하여 처리
   */
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId: value === 'none' ? '' : value
    }));
  };

  /**
   * 이미지 업로드 완료 핸들러
   */
  const handleImageUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      coverImageUrl: url
    }));
  };

  /**
   * 이미지 제거 핸들러
   */
  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      coverImageUrl: ''
    }));
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 데이터 검증
    const validation = validateFormData(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // 에러 초기화 후 제출
    setErrors([]);
    onSubmit(formData);
  };

  /**
   * slug 재생성 핸들러
   */
  const handleRegenerateSlug = () => {
    const newSlug = generateSlug(formData.title);
    setFormData(prev => ({
      ...prev,
      slug: newSlug
    }));
    setIsSlugManuallyEdited(false);
  };

  // ========================================
  // 렌더링 헬퍼 함수
  // ========================================

  /**
   * 카테고리 선택값 반환
   * 빈 문자열인 경우 "none"으로 변환
   */
  const getCategorySelectValue = () => {
    return formData.categoryId || 'none';
  };

  // ========================================
  // 메인 렌더링
  // ========================================

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 폼 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? '게시물 수정' : '새 게시물 작성'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? '게시물 정보를 수정하세요.' : '새로운 블로그 게시물을 작성하세요.'}
          </p>
        </div>
        
        {/* 상태 표시 */}
        {isSubmitting && (
          <Badge variant="secondary" className="animate-pulse">
            저장 중...
          </Badge>
        )}
      </div>

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800 mb-2">다음 오류를 수정해주세요:</h4>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Type className="w-5 h-5" />
              <span>기본 정보</span>
            </CardTitle>
            <CardDescription>
              게시물의 제목과 URL 정보를 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 제목 입력 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="게시물 제목을 입력하세요"
                disabled={isSubmitting}
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                제목을 입력하면 URL용 슬러그가 자동으로 생성됩니다
              </p>
            </div>

            {/* Slug 입력 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug" className="text-sm font-medium">
                  URL 슬러그 <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateSlug}
                  disabled={isSubmitting || !formData.title}
                  className="text-xs"
                >
                  재생성
                </Button>
              </div>
              <Input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="url-slug-example"
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                게시물의 URL에 사용됩니다: <code className="bg-gray-100 px-1 rounded">/posts/{formData.slug || 'slug'}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 커버 이미지 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5" />
              <span>커버 이미지</span>
            </CardTitle>
            <CardDescription>
              게시물의 대표 이미지를 업로드하세요 (선택사항)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onImageUploaded={handleImageUploaded}
              initialImage={formData.coverImageUrl}
              className="max-w-lg"
            />
            {formData.coverImageUrl && (
              <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-medium">커버 이미지가 설정되었습니다</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleImageRemove}
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-700"
                >
                  제거
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 카테고리 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>카테고리</span>
            </CardTitle>
            <CardDescription>
              게시물의 카테고리를 선택하세요 (선택사항)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                카테고리
              </Label>
              <Select
                value={getCategorySelectValue()}
                onValueChange={handleCategoryChange}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">카테고리 없음</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                      {category.description && (
                        <span className="text-gray-500 ml-2">- {category.description}</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                카테고리를 선택하지 않으면 '일반' 카테고리로 분류됩니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 내용 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>게시물 내용</span>
            </CardTitle>
            <CardDescription>
              게시물의 본문 내용을 작성하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                내용 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={handleContentChange}
                placeholder="게시물 내용을 작성하세요..."
                disabled={isSubmitting}
                rows={12}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Markdown 문법을 사용할 수 있습니다
                </p>
                <p className="text-xs text-gray-500">
                  {formData.content.length} 글자
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            <X className="w-4 h-4 mr-2" />
            취소
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? '저장 중...' : isEditing ? '수정 완료' : '게시물 저장'}
          </Button>
        </div>
      </form>
    </div>
  );
} 