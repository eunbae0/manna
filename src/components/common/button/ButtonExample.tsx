import React from 'react';
import { VStack } from '#/components/ui/vstack';
import { HStack } from '#/components/ui/hstack';
import { Text } from '#/components/ui/text';
import { Plus, Heart, ArrowRight } from 'lucide-react-native';
import { Button, ButtonText, ButtonIcon } from './index';
import { View } from 'react-native';

/**
 * Example component showing different button variants with rounded corners
 */
export function ButtonExample() {
  return (
    <VStack space="lg" className="p-4">
      <Text size="xl" className="font-bold">버튼 예시</Text>
      
      {/* Regular buttons with different rounded options */}
      <VStack space="md">
        <Text>라운드 옵션</Text>
        <Button rounded={false} variant="solid" action="primary">
          <ButtonText>라운드 없음</ButtonText>
        </Button>
        
        <Button variant="solid" action="primary">
          <ButtonText>기본 버튼</ButtonText>
        </Button>
        
        <Button rounded={true} variant="solid" action="primary">
          <ButtonText>완전 라운드</ButtonText>
        </Button>
      </VStack>
      
      {/* Buttons with icons */}
      <VStack space="md">
        <Text>아이콘 버튼</Text>
        <HStack space="md">
          <Button rounded={true} size="lg" variant="solid" action="primary">
            <ButtonIcon as={Plus} />
            <ButtonText>추가하기</ButtonText>
          </Button>
          
          <Button rounded={true} size="lg" variant="outline" action="primary">
            <ButtonIcon as={Heart} />
            <ButtonText>좋아요</ButtonText>
          </Button>
        </HStack>
      </VStack>
      
      {/* Different variants */}
      <VStack space="md">
        <Text>버튼 스타일</Text>
        <Button rounded={true} variant="solid" action="primary">
          <ButtonText>기본</ButtonText>
          <ButtonIcon as={ArrowRight} />
        </Button>
        
        <Button rounded={true} variant="outline" action="secondary">
          <ButtonText>아웃라인</ButtonText>
        </Button>
        
        <Button rounded={true} variant="link" action="primary">
          <ButtonText>링크</ButtonText>
        </Button>
      </VStack>
      
      {/* Different sizes */}
      <VStack space="md">
        <Text>버튼 크기</Text>
        <HStack space="md" className="items-center">
          <Button rounded={true} size="xs" variant="solid" action="primary">
            <ButtonText>XS</ButtonText>
          </Button>
          
          <Button rounded={true} size="sm" variant="solid" action="primary">
            <ButtonText>SM</ButtonText>
          </Button>
          
          <Button rounded={true} size="md" variant="solid" action="primary">
            <ButtonText>MD</ButtonText>
          </Button>
          
          <Button rounded={true} size="lg" variant="solid" action="primary">
            <ButtonText>LG</ButtonText>
          </Button>
          
          <Button rounded={true} size="xl" variant="solid" action="primary">
            <ButtonText>XL</ButtonText>
          </Button>
        </HStack>
      </VStack>
    </VStack>
  );
}
