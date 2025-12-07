import React, { useState } from 'react';
import { Share2, Download, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

const ShareImpact = ({ stats, type = 'dashboard' }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    if (type === 'dashboard' && stats) {
      return `🌱 I've saved ${stats.itemsSaved || 0} items from waste using FoodWaste Tracker!\n\n` +
        `💰 Money Saved: ₹${(stats.moneySaved || 0).toFixed(2)}\n` +
        `🌍 CO₂ Saved: ${Math.round((stats.itemsSaved || 0) * 2.5)} kg\n` +
        `💧 Water Saved: ${(stats.itemsSaved || 0) * 1800}L\n\n` +
        `Join me in reducing food waste! #FoodWasteReduction #EcoFriendly #Sustainability`;
    }
    return '🌱 Join me in reducing food waste with FoodWaste Tracker! #FoodWasteReduction';
  };

  const handleShare = async (platform) => {
    const shareText = generateShareText();
    const url = window.location.origin;

    try {
      switch (platform) {
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: 'My Food Waste Impact',
              text: shareText,
              url: url
            });
            addToast('Shared successfully!', 'success');
          } else {
            handleCopy();
          }
          break;
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
            '_blank'
          );
          break;
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
            '_blank'
          );
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            '_blank'
          );
          break;
        case 'copy':
          handleCopy();
          break;
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
      }
    }
  };

  const handleCopy = () => {
    const shareText = generateShareText();
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    addToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!stats) return;
    
    const data = {
      itemsSaved: stats.itemsSaved || 0,
      moneySaved: stats.moneySaved || 0,
      co2Saved: Math.round((stats.itemsSaved || 0) * 2.5),
      waterSaved: (stats.itemsSaved || 0) * 1800,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `food-waste-impact-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Impact data downloaded!', 'success');
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="primary"
        icon={Share2}
        onClick={() => handleShare('native')}
      >
        Share
      </Button>
      <Button
        size="sm"
        variant="secondary"
        icon={copied ? Check : Copy}
        onClick={() => handleShare('copy')}
      >
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        icon={Download}
        onClick={handleDownload}
      >
        Download
      </Button>
      <div className="flex gap-2">
        <button
          onClick={() => handleShare('twitter')}
          className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          title="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="p-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors"
          title="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ShareImpact;

