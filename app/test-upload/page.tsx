/**
 * 이미지 업로드 테스트 페이지
 * ImageUpload 컴포넌트와 Storage 정책 테스트용
 */

'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { SignInButton, SignOutButton } from '@clerk/nextjs';
import ImageUpload from '@/components/image-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, Upload, ExternalLink } from 'lucide-react';

export default function TestUploadPage() {
  const { isSignedIn, user } = useUser();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  /**
   * 이미지 업로드 완료 핸들러
   */
  const handleImageUploaded = (url: string) => {
    setUploadedImages(prev => [url, ...prev]);
    console.log('업로드된 이미지 URL:', url);
  };

  /**
   * 업로드된 이미지 목록 초기화
   */
  const clearUploadedImages = () => {
    setUploadedImages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* 페이지 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            이미지 업로드 테스트
          </h1>
          <p className="text-gray-600">
            Supabase Storage와 Clerk 인증 연동 테스트 페이지
          </p>
        </div>

        {/* 인증 상태 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>인증 상태</span>
            </CardTitle>
            <CardDescription>
              이미지 업로드를 위해서는 로그인이 필요합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSignedIn ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="default" className="bg-green-500">
                    로그인됨
                  </Badge>
                  <div>
                    <p className="font-medium">{user?.fullName || user?.firstName}</p>
                    <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                </div>
                <SignOutButton>
                  <Button variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </Button>
                </SignOutButton>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">
                    로그인 필요
                  </Badge>
                  <p className="text-gray-600">
                    이미지 업로드를 위해 로그인해주세요
                  </p>
                </div>
                <SignInButton mode="modal">
                  <Button>
                    <User className="w-4 h-4 mr-2" />
                    로그인
                  </Button>
                </SignInButton>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 이미지 업로드 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>이미지 업로드</span>
            </CardTitle>
            <CardDescription>
              JPG, PNG, GIF, WebP 파일을 업로드할 수 있습니다 (최대 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSignedIn ? (
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                className="max-w-md mx-auto"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>로그인 후 이미지 업로드가 가능합니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 업로드된 이미지 목록 */}
        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>업로드된 이미지</span>
                  </CardTitle>
                  <CardDescription>
                    총 {uploadedImages.length}개의 이미지가 업로드되었습니다
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearUploadedImages}
                >
                  목록 초기화
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="space-y-2">
                    {/* 이미지 미리보기 */}
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`업로드된 이미지 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* URL 정보 */}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-mono break-all">
                        {url}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                          className="flex-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          새 탭에서 열기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(url)}
                          className="flex-1"
                        >
                          URL 복사
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 테스트 가이드 */}
        <Card>
          <CardHeader>
            <CardTitle>테스트 가이드</CardTitle>
            <CardDescription>
              다음 단계에 따라 이미지 업로드 기능을 테스트해보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">로그인 확인</p>
                  <p className="text-sm text-gray-600">Clerk 인증이 정상적으로 작동하는지 확인</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">이미지 선택</p>
                  <p className="text-sm text-gray-600">JPG, PNG, GIF, WebP 파일 중 하나를 선택</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">업로드 실행</p>
                  <p className="text-sm text-gray-600">업로드 버튼을 클릭하여 Supabase Storage에 업로드</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">결과 확인</p>
                  <p className="text-sm text-gray-600">업로드된 이미지 URL이 정상적으로 표시되는지 확인</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Badge variant="outline" className="mt-0.5">5</Badge>
                <div>
                  <p className="font-medium">Storage 정책 테스트</p>
                  <p className="text-sm text-gray-600">다른 브라우저에서 이미지 URL에 직접 접근하여 공개 조회 확인</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 