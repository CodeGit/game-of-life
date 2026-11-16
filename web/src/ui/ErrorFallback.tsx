import { Button, Container, Stack, Text, Title } from '@mantine/core';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    <Container size="sm" py="xl">
      <Stack role="alert" align="flex-start">
        <Title order={2}>Something went wrong</Title>
        <Text c="dimmed">{errorMessage}</Text>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </Stack>
    </Container>
  );
}
