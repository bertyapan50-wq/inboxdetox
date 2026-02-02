import React from 'react';
import Button from './Button';
import { Card, CardHeader, CardBody } from './Button';

const TestPage = () => {
  return (
    <div className="p-8 space-y-4">
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Card>
        <CardHeader>Test Card</CardHeader>
        <CardBody>Card content here</CardBody>
      </Card>
    </div>
  );
};

export default TestPage;