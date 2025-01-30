import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';

interface Image {
  id: string;
  url: string;
  title: string;
}

const MAX_IMAGES = 100;

const calculateGridLayout = (count: number, maxCount: number = MAX_IMAGES) => {
  if (count <= 0) return { columns: 1, rows: 1 };
  if (count > maxCount) count = maxCount;

  const aspectRatio = 4/3;
  const totalCells = count;
  
  const idealColumns = Math.round(Math.sqrt(totalCells * aspectRatio));
  const rows = Math.ceil(totalCells / idealColumns);
  const columns = Math.ceil(totalCells / rows);

  return { 
    columns: Math.min(columns, Math.ceil(Math.sqrt(maxCount))), 
    rows: Math.min(rows, Math.ceil(Math.sqrt(maxCount)))
  };
};

const Home: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [title, setTitle] = useState('');
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup URLs when component unmounts
      images.forEach(image => {
        URL.revokeObjectURL(image.url);
      });
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [images, preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (typeof window !== 'undefined') {
        const newPreviewUrl = URL.createObjectURL(file);
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        setPreview(newPreviewUrl);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) {
      toast.error('Please enter both an image and a title.');
      return;
    }

    if (images.length >= MAX_IMAGES) {
      toast.error(`You can only register up to ${MAX_IMAGES} images.`);
      return;
    }

    if (typeof window !== 'undefined') {
      const newImage: Image = {
        id: `image-${images.length + 1}`,
        url: URL.createObjectURL(selectedFile),
        title: title
      };

      setImages(prev => [...prev, newImage]);
      setSelectedFile(null);
      setPreview(null);
      setTitle('');
      toast.success('이미지가 성공적으로 등록되었습니다!');
    }
  };

  const layout = calculateGridLayout(images.length);

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <Head>
        <title>Community Gallery</title>
        <meta name="description" content="Web3 One Million Dollar Page" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <ConnectButton />
      </div>

      <main className={styles.main}>
        <h1 className={styles.title}>Web3 One Million Dollar Page</h1>

        {isConnected && (
          <div style={{ margin: '2rem 0', width: '100%', maxWidth: '500px' }}>
            <form onSubmit={handleSubmit} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              padding: '1rem',
              border: '1px solid #eaeaea',
              borderRadius: '8px'
            }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image Title"
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ marginBottom: '1rem' }}
              />
              
              {preview && (
                <div style={{ marginBottom: '1rem' }}>
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={images.length >= MAX_IMAGES}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: images.length >= MAX_IMAGES ? '#cccccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: images.length >= MAX_IMAGES ? 'not-allowed' : 'pointer'
                }}
              >
                Register Image ({images.length}/{MAX_IMAGES})
              </button>
            </form>
          </div>
        )}

        <div style={{ margin: '2rem 0' }}>
          <h2>Board</h2>
          <div style={{ 
            width: '800px',
            height: '600px',
            position: 'relative',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              width: '100%',
              height: '100%',
              gap: '2px',
              padding: '2px',
              backgroundColor: '#eaeaea'
            }}>
              {images.slice(0, MAX_IMAGES).map((image) => (
                <div key={image.id} style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'white',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={image.url} 
                    alt={image.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '0.5rem',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '0.8rem'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {image.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;