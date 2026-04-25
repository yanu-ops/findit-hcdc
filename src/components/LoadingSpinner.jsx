export default function LoadingSpinner({ size = 'md' }) {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
    return (
      <div className="flex justify-center items-center py-10">
        <div className={`${sizes[size]} border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin`} />
      </div>
    )
  }