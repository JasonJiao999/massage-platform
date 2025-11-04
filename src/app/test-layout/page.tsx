// 创建一个新的测试文件：app/test-layout/page.tsx
export default function TestLayoutPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">布局测试页面</h1>
      
      {/* 测试1: Flex 布局 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Flex 布局测试</h2>
        <div className="flex flex-col lg:flex-row gap-4 bg-red-100 p-4">
          <div className="lg:w-1/3 bg-blue-200 p-4">左侧内容 (lg:w-1/3)</div>
          <div className="lg:w-2/3 bg-green-200 p-4">右侧内容 (lg:w-2/3)</div>
        </div>
      </div>

      {/* 测试2: Grid 布局 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Grid 布局测试</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-yellow-100 p-4">
          <div className="lg:col-span-1 bg-purple-200 p-4">左侧内容 (lg:col-span-1)</div>
          <div className="lg:col-span-2 bg-pink-200 p-4">右侧内容 (lg:col-span-2)</div>
        </div>
      </div>

      {/* 测试3: 内联样式强制布局 */}
      <div>
        <h2 className="text-xl font-semibold mb-2">内联样式测试</h2>
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#f3f4f6',
            padding: '16px'
          }}
        >
          <div style={{ width: '100%', backgroundColor: '#dbeafe', padding: '16px' }}>
            左侧内容
          </div>
          <div style={{ width: '100%', backgroundColor: '#dcfce7', padding: '16px' }}>
            右侧内容
          </div>
        </div>
      </div>
    </div>
  );
}