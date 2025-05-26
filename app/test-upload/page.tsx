/**
 * 이미지 업로드 컴포넌트 테스트 페이지
 */

'use client'

import { useState } from 'react'
import ImageUpload from '@/components/image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TestUploadPage() {
  const [uploadedUrl, setUploadedUrl] = useState<string>('')
  const [uploadHistory, setUploadHistory] = useState<string[]>([])

  /**
   * 이미지 업로드 완료 핸들러
   */
  const handleImageUploaded = (url: string) => {
    setUploadedUrl(url)
    setUploadHistory(prev => [url, ...prev.slice(0, 4)]) // 최근 5개만 유지
    console.log('업로드된 이미지 URL:', url)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          이미지 업로드 테스트
        </h1>
        <p className="text-gray-600">
          ImageUpload 컴포넌트의 기능을 테스트해보세요.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 업로드 컴포넌트 */}
        <Card>
          <CardHeader>
            <CardTitle>이미지 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload 
              onImageUploaded={handleImageUploaded}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* 결과 표시 */}
        <Card>
          <CardHeader>
            <CardTitle>업로드 결과</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 현재 업로드된 이미지 */}
            {uploadedUrl && (
              <div>
                <h3 className="font-semibold mb-2">최근 업로드된 이미지:</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">URL:</p>
                  <code className="text-xs bg-white p-2 rounded border block break-all">
                    {uploadedUrl}
                  </code>
                </div>
                
                {/* 이미지 미리보기 */}
                <div className="mt-4">
                  <h4 className="font-medium mb-2">미리보기:</h4>
                  <div className="aspect-video w-full max-w-sm bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={uploadedUrl}
                      alt="업로드된 이미지"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 업로드 히스토리 */}
            {uploadHistory.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">업로드 히스토리:</h3>
                <div className="space-y-2">
                  {uploadHistory.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index + 1}
                      </Badge>
                      <code className="text-xs bg-gray-100 p-1 rounded flex-1 truncate">
                        {url}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 안내 메시지 */}
            {!uploadedUrl && (
              <div className="text-center py-8 text-gray-500">
                <p>이미지를 업로드하면 결과가 여기에 표시됩니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 사용법 안내 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>사용법 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">지원되는 파일 형식:</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">JPG</Badge>
                <Badge variant="outline">JPEG</Badge>
                <Badge variant="outline">PNG</Badge>
                <Badge variant="outline">GIF</Badge>
                <Badge variant="outline">WebP</Badge>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">파일 크기 제한:</h3>
              <p className="text-gray-600">최대 10MB까지 업로드 가능합니다.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">테스트 단계:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>이미지 선택 버튼을 클릭하여 파일을 선택합니다</li>
                <li>선택한 이미지의 미리보기를 확인합니다</li>
                <li>업로드 버튼을 클릭하여 Supabase Storage에 업로드합니다</li>
                <li>업로드 완료 후 공개 URL을 확인합니다</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 