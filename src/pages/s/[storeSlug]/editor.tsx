import { GetServerSideProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import prisma from '@/lib/prisma';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ColorPicker } from '../../../components/ColorPicker';
import { ImageUploader } from '../../../components/ImageUploader';

// Define the section types available for stores
const SECTION_TYPES = {
  HERO: 'hero',
  FEATURED_PRODUCTS: 'featuredProducts',
  ABOUT: 'about',
  TESTIMONIALS: 'testimonials',
  GALLERY: 'gallery',
  CONTACT: 'contact',
  CUSTOM: 'custom'
};

// Available themes
const THEMES = [
  { id: 'modern', name: 'Modern', primaryColor: '#4f46e5', secondaryColor: '#3730a3' },
  { id: 'minimal', name: 'Minimal', primaryColor: '#111827', secondaryColor: '#4b5563' },
  { id: 'vibrant', name: 'Vibrant', primaryColor: '#ea580c', secondaryColor: '#9a3412' },
  { id: 'elegant', name: 'Elegant', primaryColor: '#7e22ce', secondaryColor: '#5b21b6' },
  { id: 'nature', name: 'Nature', primaryColor: '#16a34a', secondaryColor: '#166534' },
];

interface StoreSection {
  id: string;
  type: string;
  title?: string;
  content?: string;
  order: number;
  settings?: any;
}

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  theme: any;
  settings: any;
  sections?: StoreSection[];
}

interface Props {
  store: Store;
  ownerToken: string | null;
}

const StoreEditor: NextPage<Props> = ({ store, ownerToken }) => {
  const router = useRouter();
  const [currentStore, setCurrentStore] = useState<Store>(store);
  const [sections, setSections] = useState<StoreSection[]>(store.sections || []);
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logo);
  const [bannerPreview, setBannerPreview] = useState<string | null>(store.banner);
  const [logoSize, setLogoSize] = useState<number>(
    store.settings?.logoSize || 150
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>(
    store.theme?.id || 'modern'
  );
  const [primaryColor, setPrimaryColor] = useState<string>(
    store.theme?.primaryColor || '#4f46e5'
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    store.theme?.secondaryColor || '#3730a3'
  );
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  // Comment out the authentication check that causes redirection
  // useEffect(() => {
  //   // In a real app, we would verify the token here
  //   if (!ownerToken) {
  //     router.push(`/s/${store.slug}`);
  //   }
  // }, [ownerToken, router, store.slug]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeChange = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      setSelectedTheme(themeId);
      setPrimaryColor(theme.primaryColor);
      setSecondaryColor(theme.secondaryColor);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setSections(updatedItems);
  };

  const addSection = (type: string) => {
    const newSection: StoreSection = {
      id: Date.now().toString(),
      type,
      title: `New ${type} Section`,
      content: '',
      order: sections.length,
      settings: {}
    };
    
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
  };

  const updateSection = (id: string, updates: Partial<StoreSection>) => {
    setSections(
      sections.map(section => 
        section.id === id ? { ...section, ...updates } : section
      )
    );
  };

  const saveChanges = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      console.log('Starting save process with sections:', sections);
      
      // Prepare sections data by ensuring proper structure
      const preparedSections = sections.map(section => ({
        id: section.id,
        type: section.type,
        title: section.title || '',
        content: section.content || '',
        order: section.order || 0,
        settings: {
          ...section.settings,
          subtitle: section.settings?.subtitle || '',
          buttonText: section.settings?.buttonText || 'Shop Now'
        }
      }));
      
      const updatedStore = {
        name: currentStore.name,
        description: currentStore.description,
        logo: logoPreview,
        banner: bannerPreview,
        theme: {
          id: selectedTheme,
          primaryColor,
          secondaryColor
        },
        settings: {
          ...currentStore.settings,
          logoSize,
          sections: preparedSections
        }
      };

      console.log('Sending updated store data:', updatedStore);

      // Make the actual API call to save changes
      const response = await fetch(`/api/stores/${store.id}/customize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_MERCACIO_API_KEY || ''
        },
        body: JSON.stringify(updatedStore)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const result = await response.json();
      console.log('Received response from API:', result);
      
      if (result.success) {
        console.log('Save successful, updating state with new store data');
        setCurrentStore(result.store);
        setSections(result.store.settings?.sections || []);
        setSaveMessage('Changes saved successfully!');
      
        // Redirect to store page with cache-busting parameter
        const redirectUrl = `/s/${store.slug}?t=${Date.now()}`;
        console.log('Redirecting to:', redirectUrl);
        router.push(redirectUrl);
      } else {
        throw new Error(result.error || 'Failed to save changes');
      }

    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveMessage('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout title={`Edit Store: ${store.name}`}>
      <div className="min-h-screen bg-gray-100">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => router.push(`/s/${store.slug}`)}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                ← Back to Store
              </button>
              <h1 className="text-xl font-medium text-gray-900">Edit Store: {store.name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {saveMessage && <span className={saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}>{saveMessage}</span>}
              </div>
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sidebar with settings */}
            <div className="md:col-span-1 space-y-6">
              {/* Collapsible panels */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 text-left font-medium bg-gray-50 flex justify-between items-center"
                  onClick={() => setOpenPanel(openPanel === 'logo' ? null : 'logo')}
                >
                  <span>Logo & Banner</span>
                  <svg className={`h-5 w-5 transform ${openPanel === 'logo' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openPanel === 'logo' && (
                  <div className="p-4 space-y-4">
                    {/* Logo upload */}
                    <div>
                      <ImageUploader
                        currentImage={logoPreview}
                        onImageChange={setLogoPreview}
                        label="Store Logo"
                        aspectRatio="square"
                      />
                    </div>

                    {/* Logo size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo Size: {logoSize}px
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={logoSize}
                        onChange={(e) => setLogoSize(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Banner upload */}
                    <div>
                      <ImageUploader
                        currentImage={bannerPreview}
                        onImageChange={setBannerPreview}
                        label="Store Banner"
                        aspectRatio="banner"
                        placeholder="Upload a banner for your store"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Theme settings panel */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 text-left font-medium bg-gray-50 flex justify-between items-center"
                  onClick={() => setOpenPanel(openPanel === 'theme' ? null : 'theme')}
                >
                  <span>Theme & Colors</span>
                  <svg className={`h-5 w-5 transform ${openPanel === 'theme' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openPanel === 'theme' && (
                  <div className="p-4 space-y-4">
                    {/* Theme selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Theme
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        value={selectedTheme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                      >
                        {THEMES.map(theme => (
                          <option key={theme.id} value={theme.id}>
                            {theme.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color pickers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <ColorPicker
                        color={primaryColor}
                        onChange={setPrimaryColor}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Color
                      </label>
                      <ColorPicker
                        color={secondaryColor}
                        onChange={setSecondaryColor}
                      />
                    </div>

                    {/* Color preview */}
                    <div className="pt-2">
                      <div className="flex space-x-2">
                        <div 
                          className="h-10 w-1/2 rounded-md" 
                          style={{ backgroundColor: primaryColor }}
                        />
                        <div 
                          className="h-10 w-1/2 rounded-md" 
                          style={{ backgroundColor: secondaryColor }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Primary: {primaryColor}</span>
                        <span>Secondary: {secondaryColor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Store details panel */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 text-left font-medium bg-gray-50 flex justify-between items-center"
                  onClick={() => setOpenPanel(openPanel === 'details' ? null : 'details')}
                >
                  <span>Store Details</span>
                  <svg className={`h-5 w-5 transform ${openPanel === 'details' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openPanel === 'details' && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        value={currentStore.name}
                        onChange={(e) => setCurrentStore({ ...currentStore, name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Description
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        rows={4}
                        value={currentStore.description || ''}
                        onChange={(e) => setCurrentStore({ ...currentStore, description: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main content area with section editor */}
            <div className="md:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Page Sections</h2>
                
                {/* Section adder */}
                <div className="mb-6 border-b pb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add New Section
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(SECTION_TYPES).map(type => (
                      <button
                        key={type}
                        onClick={() => addSection(type)}
                        className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm hover:bg-indigo-100"
                      >
                        + {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag and drop section editor */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sections">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {sections.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-md">
                            No sections added yet. Add a section to get started.
                          </div>
                        ) : (
                          sections
                            .sort((a, b) => a.order - b.order)
                            .map((section, index) => (
                              <Draggable key={section.id} draggableId={section.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden"
                                  >
                                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                                          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                          </svg>
                                        </div>
                                        <span className="font-medium capitalize">{section.type}</span>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => removeSection(section.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Section Title
                                          </label>
                                          <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                            value={section.title || ''}
                                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                          />
                                        </div>
                                        
                                        {/* Show different inputs based on section type */}
                                        {section.type === SECTION_TYPES.CUSTOM && (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Section Content
                                            </label>
                                            <textarea
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                              rows={4}
                                              value={section.content || ''}
                                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                            />
                                          </div>
                                        )}
                                        
                                        {/* Featured products section */}
                                        {section.type === SECTION_TYPES.FEATURED_PRODUCTS && (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Number of Products to Show
                                            </label>
                                            <input
                                              type="number"
                                              min="1"
                                              max="12"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                              value={section.settings?.productCount || 3}
                                              onChange={(e) => updateSection(section.id, { 
                                                settings: { 
                                                  ...section.settings,
                                                  productCount: parseInt(e.target.value) 
                                                } 
                                              })}
                                            />
                                          </div>
                                        )}
                                        
                                        {/* Hero section */}
                                        {section.type === SECTION_TYPES.HERO && (
                                          <div className="space-y-4">
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hero Title
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                                value={section.title || ''}
                                                onChange={(e) => updateSection(section.id, { 
                                                  title: e.target.value 
                                                })}
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Hero Subtitle
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                                value={section.settings?.subtitle || ''}
                                                onChange={(e) => updateSection(section.id, { 
                                                  settings: { 
                                                    ...section.settings,
                                                    subtitle: e.target.value 
                                                  } 
                                                })}
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Button Text
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                                value={section.settings?.buttonText || 'Shop Now'}
                                                onChange={(e) => updateSection(section.id, { 
                                                  settings: { 
                                                    ...section.settings,
                                                    buttonText: e.target.value 
                                                  } 
                                                })}
                                              />
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* About section */}
                                        {section.type === SECTION_TYPES.ABOUT && (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              About Content
                                            </label>
                                            <textarea
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                              rows={4}
                                              value={section.content || ''}
                                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                            />
                                          </div>
                                        )}
                                        
                                        {/* Testimonials section */}
                                        {section.type === SECTION_TYPES.TESTIMONIALS && (
                                          <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              Testimonials (Coming soon)
                                            </label>
                                            <div className="text-sm text-gray-500">
                                              This editor will allow adding and editing testimonials.
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Other section types can be implemented similarly */}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Preview button */}
              <div className="mt-4 text-right">
                <button
                  onClick={() => router.push(`/s/${store.slug}?preview=true`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Preview Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
  try {
    const storeSlug = params?.storeSlug as string;
    
    // Always provide a dummy token for testing
    const ownerToken = 'dummy-token-for-testing';

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        banner: true,
        theme: true,
        settings: true,
        ownerId: true
      }
    });

    if (!store) {
      return {
        notFound: true
      };
    }
    
    // In a real app, we would verify the token here to ensure
    // the user has permission to edit this store
    // const isAuthorized = verifyToken(ownerToken, store.ownerId);
    // if (!isAuthorized) {
    //   return {
    //     redirect: {
    //       destination: `/s/${storeSlug}`,
    //       permanent: false,
    //     },
    //   };
    // }

    // Modify the store object to include default sections if none exist
    const storeWithSections = {
      ...store,
      sections: [
        {
          id: '1',
          type: 'hero',
          title: 'Welcome to our Store',
          order: 0,
          settings: {
            subtitle: 'Discover our amazing products',
            buttonText: 'Shop Now'
          }
        },
        {
          id: '2', 
          type: 'featuredProducts',
          title: 'Featured Products',
          order: 1,
          settings: {
            productCount: 3
          }
        }
      ]
    };

    return {
      props: {
        store: storeWithSections,
        ownerToken: ownerToken || null
      }
    };
  } catch (error) {
    console.error('Error fetching store:', error);
    return {
      notFound: true
    };
  }
};

export default StoreEditor; 