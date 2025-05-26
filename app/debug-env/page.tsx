'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'

export default function DebugEnvPage() {
  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const maskValue = (value: string | undefined) => {
    if (!value) return '❌ 설정되지 않음'
    return `${value.substring(0, 8)}${'*'.repeat(Math.max(0, value.length - 8))}`
  }

  const isValid = (value: string | undefined) => {
    return value && value.length > 0
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 환경 변수 상태 확인
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">NEXT_PUBLIC_SUPABASE_URL</div>
                <div className="text-sm text-muted-foreground">
                  {maskValue(supabaseUrl)}
                </div>
              </div>
              {isValid(supabaseUrl) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <div className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                <div className="text-sm text-muted-foreground">
                  {maskValue(supabaseAnonKey)}
                </div>
              </div>
              {isValid(supabaseAnonKey) ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded">
            <h3 className="font-semibold mb-2">상태 요약</h3>
            {isValid(supabaseUrl) && isValid(supabaseAnonKey) ? (
              <Badge variant="default" className="bg-green-500">
                ✅ 환경 변수 정상 설정됨
              </Badge>
            ) : (
              <Badge variant="destructive">
                ❌ 환경 변수 설정 필요
              </Badge>
            )}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>다음 단계:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>환경 변수가 설정되지 않았다면 .env.local 파일 확인</li>
              <li>설정되었다면 <a href="/test-supabase" className="text-primary hover:underline">Supabase 연결 테스트</a> 실행</li>
              <li>연결 성공 시 <a href="/" className="text-primary hover:underline">홈페이지</a>에서 데이터 확인</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 