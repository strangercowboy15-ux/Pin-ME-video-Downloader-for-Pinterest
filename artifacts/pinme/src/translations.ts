export type Language = 'en' | 'zh' | 'ja' | 'es' | 'pt' | 'bg' | 'de';

export const translations = {
  en: {
    heading: 'Download Pinterest videos, images, GIFs & carousels',
    subtitle: 'Fast, free, and directly to your device.',
    placeholder: 'Paste Pinterest link here...',
    downloadNow: 'Download Now',
    infoText:
      "Your download will be saved to your device's Downloads folder (and usually appears in your Gallery/Photos app automatically).",
    howItWorks: 'How it works?',
    step1: 'Copy a Pinterest video link 📎',
    step2: 'Paste it in the box above 📥',
    step3: 'Click "Download Now" 📹',
    step4: 'Your video saves to your device 📱',
    faq: 'Frequently Asked Questions',
    faq1Q: 'Is Pin ME free?',
    faq1A: 'Yes, completely free. No account required.',
    faq2Q: 'Where do downloads go?',
    faq2A: "Your video saves to your device's Downloads folder.",
    faq3Q: 'Do you store my links?',
    faq3A: 'No. Links are processed and deleted immediately.',

    checkingMedia: 'Checking media type...',
    fetchingInfo: 'Fetching video info...',
    fetchingVideoInfo: 'Fetching video info...',
    fetchingImageInfo: 'Fetching image info...',
    fetchingCarouselInfo: 'Fetching carousel info...',
    fetchingGifInfo: 'Fetching GIF info...',
    downloadingVideo: 'Downloading video...',
    downloadingImage: 'Downloading image...',
    downloadingGif: 'Downloading GIF...',
    downloadingCarousel: 'Downloading carousel...',
    processingVideo: 'Processing video...',
    convertingImageSvg: 'Converting image to SVG...',
    convertingImagePng: 'Converting image to PNG...',
    convertingCarouselSvg: 'Converting carousel to SVG...',
    convertingCarouselPng: 'Converting carousel to PNG...',
    packagingCarousel: 'Packaging carousel...',
    preparingDownload: 'Preparing download...',
    startingDownload: 'Starting download...',

    videoDownloaded: 'Video downloaded',
    imageDownloaded: 'Image downloaded',
    carouselDownloaded: 'Carousel downloaded as ZIP',
    imagesCount: 'images',
    errorGeneric:
      'Something went wrong. Please check your connection and try again.',
    serverStarting: 'Starting server',
    serverWakingText:
      'The server is waking up — this usually takes 20–30 seconds. Hang tight!',
    howItWorksFooter: 'How It Works & FAQ',
    howItWorksHomeFooter: 'How It Works & FAQ',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',

    // How It Works page
    howItWorksClose: 'Close How It Works and return to the home page',
    howItWorksHome: 'Return to the home page',
    howItWorksPageTitle: 'How It Works & FAQ',
    howItWorksPageSubtitle:
      'Learn how to use pinME and find answers to common questions.',
    howItWorksSectionTitle: 'How It Works',
    howStep1Title: '1. Copy a Pinterest link 📎',
    howStep1Description:
      'Copy the Pinterest link containing the video, image, GIF, or carousel you want to download.',
    howStep2Title: '2. Paste it in the box above 📥',
    howStep2Description:
      'Paste the copied Pinterest link into the download box on pinME.',
    howStep3Title: '3. Click "Download Now" ⬇️',
    howStep3Description:
      'Start the download and let pinME process the requested media.',
    howStep4Title: '4. Your download saves to your device 📱',
    howStep4Description:
      'The downloaded file is sent directly to your device.',
    supportedDownloadsTitle: 'Supported Downloads',
    supportedVideos: 'Videos',
    supportedImages: 'Single Images',
    supportedGifs: 'GIFs',
    supportedCarousels: 'Carousels',
    supportedCarouselsDescription: 'downloaded as a ZIP file',
    faqPageTitle: 'Frequently Asked Questions',
    faqPage1Question: '💯 Is pinME free?',
    faqPage1Answer:
      'Yes. pinME is completely free to use and does not require an account.',
    faqPage2Question: '🗂️ Where do downloads go?',
    faqPage2Answer:
      "Your downloaded file is saved to your device's Downloads folder. Depending on your device, it may also appear in your Gallery or Photos app.",
    faqPage3Question: '🔒 Do you store my Pinterest links?',
    faqPage3Answer:
      'No. Pinterest links are processed only to provide the requested download and are not permanently stored.',
    faqPage4Question: '👤 Do I need an account?',
    faqPage4Answer:
      'No. You can use pinME without creating an account or signing in.',
    faqPage5Question: '📦 How are carousel downloads delivered?',
    faqPage5Answer:
      'Carousel images are collected and provided together as a ZIP file containing the images.',
    faqPage6Question: '🔗 Is pinME affiliated with Pinterest?',
    faqPage6Answer:
      'No. pinME is an independent service and is not affiliated with, sponsored by, or officially connected with Pinterest.',
  },

  zh: {
    heading: '下载 Pinterest 视频、图片、GIF 和轮播图',
    subtitle: '快速、免费，直接保存到您的设备。',
    placeholder: '在此粘贴 Pinterest 链接...',
    downloadNow: '立即下载',
    infoText:
      '您的下载将保存到设备的下载文件夹（通常会自动出现在相册/照片应用中）。',
    howItWorks: '使用方法？',
    step1: '复制 Pinterest 视频链接 📎',
    step2: '粘贴到上方输入框 📥',
    step3: '点击"立即下载" 📹',
    step4: '视频保存到您的设备 📱',
    faq: '常见问题',
    faq1Q: 'Pin ME 免费吗？',
    faq1A: '是的，完全免费。无需注册账号。',
    faq2Q: '下载文件保存在哪里？',
    faq2A: '视频保存在您设备的下载文件夹中。',
    faq3Q: '你们会保存我的链接吗？',
    faq3A: '不会。链接会立即处理并删除。',

    checkingMedia: '正在检查媒体类型...',
    fetchingInfo: '正在获取视频信息...',
    fetchingVideoInfo: '正在获取视频信息...',
    fetchingImageInfo: '正在获取图片信息...',
    fetchingCarouselInfo: '正在获取轮播图信息...',
    fetchingGifInfo: '正在获取 GIF 信息...',
    downloadingVideo: '正在下载视频...',
    downloadingImage: '正在下载图片...',
    downloadingGif: '正在下载 GIF...',
    downloadingCarousel: '正在下载轮播图...',
    processingVideo: '正在处理视频...',
    convertingImageSvg: '正在将图片转换为 SVG...',
    convertingImagePng: '正在将图片转换为 PNG...',
    convertingCarouselSvg: '正在将轮播图转换为 SVG...',
    convertingCarouselPng: '正在将轮播图转换为 PNG...',
    packagingCarousel: '正在打包轮播图...',
    preparingDownload: '正在准备下载...',
    startingDownload: '正在开始下载...',

    videoDownloaded: '视频已下载',
    imageDownloaded: '图片已下载',
    carouselDownloaded: '轮播图已下载为 ZIP',
    imagesCount: '张图片',
    errorGeneric: '出错了。请检查您的网络连接并重试。',
    serverStarting: '正在启动服务器',
    serverWakingText: '服务器正在唤醒——通常需要 20–30 秒。请稍候！',
    howItWorksFooter: '使用方法与常见问题',
    howItWorksHomeFooter: '使用方法与常见问题',
    privacyPolicy: '隐私政策',
    termsConditions: '条款和条件',

    // How It Works page
    howItWorksClose: '关闭使用方法并返回主页',
    howItWorksHome: '返回主页',
    howItWorksPageTitle: '使用方法与常见问题',
    howItWorksPageSubtitle:
      '了解如何使用 pinME，并查看常见问题的答案。',
    howItWorksSectionTitle: '使用方法',
    howStep1Title: '1. 复制 Pinterest 链接 📎',
    howStep1Description:
      '复制包含您想下载的视频、图片、GIF 或轮播图的 Pinterest 链接。',
    howStep2Title: '2. 粘贴到上方输入框 📥',
    howStep2Description:
      '将复制的 Pinterest 链接粘贴到 pinME 的下载框中。',
    howStep3Title: '3. 点击“立即下载” ⬇️',
    howStep3Description:
      '开始下载，让 pinME 处理您请求的媒体内容。',
    howStep4Title: '4. 下载文件保存到您的设备 📱',
    howStep4Description: '下载完成后，文件会直接保存到您的设备。',
    supportedDownloadsTitle: '支持的下载类型',
    supportedVideos: '视频',
    supportedImages: '单张图片',
    supportedGifs: 'GIF',
    supportedCarousels: '轮播图',
    supportedCarouselsDescription: '以 ZIP 文件下载',
    faqPageTitle: '常见问题',
    faqPage1Question: '💯 pinME 免费吗？',
    faqPage1Answer: '是的。pinME 完全免费使用，无需账号。',
    faqPage2Question: '🗂️ 下载文件保存在哪里？',
    faqPage2Answer:
      '下载的文件会保存到您设备的 Downloads 文件夹中，根据设备不同，也可能出现在相册或照片应用中。',
    faqPage3Question: '🔒 你们会保存我的 Pinterest 链接吗？',
    faqPage3Answer:
      '不会。Pinterest 链接仅用于处理您请求的下载，不会被永久保存。',
    faqPage4Question: '👤 我需要注册账号吗？',
    faqPage4Answer:
      '不需要。您无需创建账号或登录即可使用 pinME。',
    faqPage5Question: '📦 轮播图如何下载？',
    faqPage5Answer:
      '轮播图中的图片会被收集并一起打包成 ZIP 文件提供下载。',
    faqPage6Question: '🔗 pinME 与 Pinterest 有关联吗？',
    faqPage6Answer:
      '没有。pinME 是独立服务，与 Pinterest 没有官方关联、赞助或合作关系。',
  },

  ja: {
    heading: 'Pinterest の動画・画像・GIF・カルーセルをダウンロード',
    subtitle: '高速、無料、デバイスに直接保存。',
    placeholder: 'ここに Pinterest リンクを貼り付け...',
    downloadNow: '今すぐダウンロード',
    infoText:
      'ダウンロードはデバイスの Downloads フォルダに保存されます（通常はギャラリー/写真アプリにも自動的に表示されます）。',
    howItWorks: '使い方',
    step1: 'Pinterest の動画リンクをコピー 📎',
    step2: '上のボックスに貼り付け 📥',
    step3: '「今すぐダウンロード」をクリック 📹',
    step4: '動画がデバイスに保存されます 📱',
    faq: 'よくある質問',
    faq1Q: 'Pin ME は無料ですか？',
    faq1A: 'はい、完全に無料です。アカウントは不要です。',
    faq2Q: 'ダウンロード先はどこですか？',
    faq2A: '動画はデバイスの Downloads フォルダに保存されます。',
    faq3Q: 'リンクは保存されますか？',
    faq3A: 'いいえ。リンクは処理後すぐに削除されます。',

    checkingMedia: 'メディアの種類を確認しています...',
    fetchingInfo: '動画情報を取得しています...',
    fetchingVideoInfo: '動画情報を取得しています...',
    fetchingImageInfo: '画像情報を取得しています...',
    fetchingCarouselInfo: 'カルーセル情報を取得しています...',
    fetchingGifInfo: 'GIF情報を取得しています...',
    downloadingVideo: '動画をダウンロードしています...',
    downloadingImage: '画像をダウンロードしています...',
    downloadingGif: 'GIFをダウンロードしています...',
    downloadingCarousel: 'カルーセルをダウンロードしています...',
    processingVideo: '動画を処理しています...',
    convertingImageSvg: '画像をSVGに変換しています...',
    convertingImagePng: '画像をPNGに変換しています...',
    convertingCarouselSvg: 'カルーセルをSVGに変換しています...',
    convertingCarouselPng: 'カルーセルをPNGに変換しています...',
    packagingCarousel: 'カルーセルをパッケージ化しています...',
    preparingDownload: 'ダウンロードを準備しています...',
    startingDownload: 'ダウンロードを開始しています...',

    videoDownloaded: '動画をダウンロードしました',
    imageDownloaded: '画像をダウンロードしました',
    carouselDownloaded: 'カルーセルを ZIP でダウンロードしました',
    imagesCount: '枚の画像',
    errorGeneric: '問題が発生しました。接続を確認して再試行してください。',
    serverStarting: 'サーバーを起動中',
    serverWakingText:
      'サーバーを起動しています — 通常 20〜30 秒かかります。少々お待ちください！',
    howItWorksFooter: '使い方とよくある質問',
    howItWorksHomeFooter: '使い方とよくある質問',
    privacyPolicy: 'プライバシーポリシー',
    termsConditions: '利用規約',

    // How It Works page
    howItWorksClose: '使い方を閉じてホームページに戻る',
    howItWorksHome: 'ホームページに戻る',
    howItWorksPageTitle: '使い方とよくある質問',
    howItWorksPageSubtitle:
      'pinME の使い方と、よくある質問への回答をご覧ください。',
    howItWorksSectionTitle: '使い方',
    howStep1Title: '1. Pinterest リンクをコピー 📎',
    howStep1Description:
      'ダウンロードしたい動画、画像、GIF、またはカルーセルを含む Pinterest リンクをコピーします。',
    howStep2Title: '2. 上のボックスに貼り付け 📥',
    howStep2Description:
      'コピーした Pinterest リンクを pinME のダウンロードボックスに貼り付けます。',
    howStep3Title: '3. 「今すぐダウンロード」をクリック ⬇️',
    howStep3Description:
      'ダウンロードを開始し、pinME がメディアを処理します。',
    howStep4Title: '4. ダウンロードがデバイスに保存されます 📱',
    howStep4Description:
      'ダウンロードしたファイルはデバイスに直接保存されます。',
    supportedDownloadsTitle: '対応しているダウンロード',
    supportedVideos: '動画',
    supportedImages: '画像',
    supportedGifs: 'GIF',
    supportedCarousels: 'カルーセル',
    supportedCarouselsDescription: 'ZIP ファイルとしてダウンロード',
    faqPageTitle: 'よくある質問',
    faqPage1Question: '💯 pinME は無料ですか？',
    faqPage1Answer:
      'はい。pinME は完全無料で利用でき、アカウントも必要ありません。',
    faqPage2Question: '🗂️ ダウンロード先はどこですか？',
    faqPage2Answer:
      'ダウンロードしたファイルはデバイスの Downloads フォルダに保存されます。デバイスによってはギャラリーや写真アプリにも表示されます。',
    faqPage3Question: '🔒 Pinterest リンクは保存されますか？',
    faqPage3Answer:
      'いいえ。Pinterest リンクはダウンロード処理のためだけに使用され、永久に保存されることはありません。',
    faqPage4Question: '👤 アカウントは必要ですか？',
    faqPage4Answer:
      'いいえ。アカウントを作成したりサインインしたりせずに pinME を使用できます。',
    faqPage5Question: '📦 カルーセルはどのようにダウンロードされますか？',
    faqPage5Answer:
      'カルーセルの画像はまとめて収集され、画像を含む ZIP ファイルとして提供されます。',
    faqPage6Question: '🔗 pinME は Pinterest と提携していますか？',
    faqPage6Answer:
      'いいえ。pinME は独立したサービスであり、Pinterest とは公式な提携、スポンサー関係、または接続はありません。',
  },

  es: {
    heading: 'Descarga videos, imágenes, GIFs y carruseles de Pinterest',
    subtitle: 'Rápido, gratis y directamente a tu dispositivo.',
    placeholder: 'Pega el enlace de Pinterest aquí...',
    downloadNow: 'Descargar ahora',
    infoText:
      'Tu descarga se guardará en la carpeta Descargas de tu dispositivo (y normalmente aparece en la Galería/Fotos automáticamente).',
    howItWorks: '¿Cómo funciona?',
    step1: 'Copia un enlace de video de Pinterest 📎',
    step2: 'Pégalo en el cuadro de arriba 📥',
    step3: 'Haz clic en "Descargar ahora" 📹',
    step4: 'Tu video se guarda en tu dispositivo 📱',
    faq: 'Preguntas frecuentes',
    faq1Q: '¿Pin ME es gratis?',
    faq1A: 'Sí, completamente gratis. No se requiere cuenta.',
    faq2Q: '¿Dónde van las descargas?',
    faq2A: 'Tu video se guarda en la carpeta Descargas de tu dispositivo.',
    faq3Q: '¿Guardan mis enlaces?',
    faq3A: 'No. Los enlaces se procesan y eliminan inmediatamente.',

    checkingMedia: 'Comprobando tipo de contenido...',
    fetchingInfo: 'Obteniendo información del video...',
    fetchingVideoInfo: 'Obteniendo información del video...',
    fetchingImageInfo: 'Obteniendo información de la imagen...',
    fetchingCarouselInfo: 'Obteniendo información del carrusel...',
    fetchingGifInfo: 'Obteniendo información del GIF...',
    downloadingVideo: 'Descargando video...',
    downloadingImage: 'Descargando imagen...',
    downloadingGif: 'Descargando GIF...',
    downloadingCarousel: 'Descargando carrusel...',
    processingVideo: 'Procesando video...',
    convertingImageSvg: 'Convirtiendo imagen a SVG...',
    convertingImagePng: 'Convirtiendo imagen a PNG...',
    convertingCarouselSvg: 'Convirtiendo carrusel a SVG...',
    convertingCarouselPng: 'Convirtiendo carrusel a PNG...',
    packagingCarousel: 'Preparando el carrusel...',
    preparingDownload: 'Preparando descarga...',
    startingDownload: 'Iniciando descarga...',

    videoDownloaded: 'Video descargado',
    imageDownloaded: 'Imagen descargada',
    carouselDownloaded: 'Carrusel descargado como ZIP',
    imagesCount: 'imágenes',
    errorGeneric:
      'Algo salió mal. Comprueba tu conexión e inténtalo de nuevo.',
    serverStarting: 'Iniciando servidor',
    serverWakingText:
      'El servidor se está activando — suele tardar 20–30 segundos. ¡Espera!',
    howItWorksFooter: 'Cómo funciona y FAQ',
    howItWorksHomeFooter: 'Cómo funciona y FAQ',
    privacyPolicy: 'Política de privacidad',
    termsConditions: 'Términos y condiciones',

    // How It Works page
    howItWorksClose: 'Cerrar y volver a la página de inicio',
    howItWorksHome: 'Volver a la página de inicio',
    howItWorksPageTitle: 'Cómo funciona y preguntas frecuentes',
    howItWorksPageSubtitle:
      'Aprende a usar pinME y encuentra respuestas a preguntas frecuentes.',
    howItWorksSectionTitle: 'Cómo funciona',
    howStep1Title: '1. Copia un enlace de Pinterest 📎',
    howStep1Description:
      'Copia el enlace de Pinterest que contiene el video, imagen, GIF o carrusel que quieres descargar.',
    howStep2Title: '2. Pégalo en el cuadro de arriba 📥',
    howStep2Description:
      'Pega el enlace de Pinterest copiado en el cuadro de descarga de pinME.',
    howStep3Title: '3. Haz clic en "Descargar ahora" ⬇️',
    howStep3Description:
      'Inicia la descarga y deja que pinME procese el contenido solicitado.',
    howStep4Title: '4. Tu descarga se guarda en tu dispositivo 📱',
    howStep4Description:
      'El archivo descargado se envía directamente a tu dispositivo.',
    supportedDownloadsTitle: 'Descargas compatibles',
    supportedVideos: 'Videos',
    supportedImages: 'Imágenes individuales',
    supportedGifs: 'GIFs',
    supportedCarousels: 'Carruseles',
    supportedCarouselsDescription: 'descargados como archivo ZIP',
    faqPageTitle: 'Preguntas frecuentes',
    faqPage1Question: '💯 ¿pinME es gratis?',
    faqPage1Answer:
      'Sí. pinME es completamente gratis y no requiere una cuenta.',
    faqPage2Question: '🗂️ ¿Dónde van las descargas?',
    faqPage2Answer:
      'El archivo descargado se guarda en la carpeta Descargas de tu dispositivo. Dependiendo del dispositivo, también puede aparecer en la Galería o Fotos.',
    faqPage3Question: '🔒 ¿Guardan mis enlaces de Pinterest?',
    faqPage3Answer:
      'No. Los enlaces de Pinterest se procesan únicamente para proporcionar la descarga solicitada y no se almacenan permanentemente.',
    faqPage4Question: '👤 ¿Necesito una cuenta?',
    faqPage4Answer:
      'No. Puedes usar pinME sin crear una cuenta ni iniciar sesión.',
    faqPage5Question: '📦 ¿Cómo se entregan las descargas de carruseles?',
    faqPage5Answer:
      'Las imágenes del carrusel se recopilan y se proporcionan juntas en un archivo ZIP.',
    faqPage6Question: '🔗 ¿pinME está afiliado a Pinterest?',
    faqPage6Answer:
      'No. pinME es un servicio independiente y no está afiliado, patrocinado ni conectado oficialmente con Pinterest.',
  },

  pt: {
    heading: 'Baixe vídeos, imagens, GIFs e carrosséis do Pinterest',
    subtitle: 'Rápido, grátis e diretamente no seu dispositivo.',
    placeholder: 'Cole o link do Pinterest aqui...',
    downloadNow: 'Baixar agora',
    infoText:
      'Seu download será salvo na pasta Downloads do seu dispositivo (e geralmente aparece automaticamente na Galeria/Fotos).',
    howItWorks: 'Como funciona?',
    step1: 'Copie um link de vídeo do Pinterest 📎',
    step2: 'Cole na caixa acima 📥',
    step3: 'Clique em "Baixar agora" 📹',
    step4: 'Seu vídeo é salvo no seu dispositivo 📱',
    faq: 'Perguntas frequentes',
    faq1Q: 'O Pin ME é grátis?',
    faq1A: 'Sim, completamente grátis. Não é necessária conta.',
    faq2Q: 'Onde vão os downloads?',
    faq2A: 'Seu vídeo é salvo na pasta Downloads do seu dispositivo.',
    faq3Q: 'Vocês armazenam meus links?',
    faq3A: 'Não. Os links são processados e excluídos imediatamente.',

    checkingMedia: 'Verificando tipo de mídia...',
    fetchingInfo: 'Obtendo informações do vídeo...',
    fetchingVideoInfo: 'Obtendo informações do vídeo...',
    fetchingImageInfo: 'Obtendo informações da imagem...',
    fetchingCarouselInfo: 'Obtendo informações do carrossel...',
    fetchingGifInfo: 'Obtendo informações do GIF...',
    downloadingVideo: 'Baixando vídeo...',
    downloadingImage: 'Baixando imagem...',
    downloadingGif: 'Baixando GIF...',
    downloadingCarousel: 'Baixando carrossel...',
    processingVideo: 'Processando vídeo...',
    convertingImageSvg: 'Convertendo imagem para SVG...',
    convertingImagePng: 'Convertendo imagem para PNG...',
    convertingCarouselSvg: 'Convertendo carrossel para SVG...',
    convertingCarouselPng: 'Convertendo carrossel para PNG...',
    packagingCarousel: 'Empacotando carrossel...',
    preparingDownload: 'Preparando download...',
    startingDownload: 'Iniciando download...',

    videoDownloaded: 'Vídeo baixado',
    imageDownloaded: 'Imagem baixada',
    carouselDownloaded: 'Carrossel baixado como ZIP',
    imagesCount: 'imagens',
    errorGeneric:
      'Algo deu errado. Verifique sua conexão e tente novamente.',
    serverStarting: 'Iniciando servidor',
    serverWakingText:
      'O servidor está acordando — geralmente leva 20–30 segundos. Aguarde!',
    howItWorksFooter: 'Como funciona e FAQ',
    howItWorksHomeFooter: 'Como funciona e FAQ',
    privacyPolicy: 'Política de Privacidade',
    termsConditions: 'Termos e Condições',

    // How It Works page
    howItWorksClose: 'Fechar e voltar para a página inicial',
    howItWorksHome: 'Voltar para a página inicial',
    howItWorksPageTitle: 'Como funciona e perguntas frequentes',
    howItWorksPageSubtitle:
      'Aprenda a usar o pinME e encontre respostas para perguntas comuns.',
    howItWorksSectionTitle: 'Como funciona',
    howStep1Title: '1. Copie um link do Pinterest 📎',
    howStep1Description:
      'Copie o link do Pinterest que contém o vídeo, imagem, GIF ou carrossel que você deseja baixar.',
    howStep2Title: '2. Cole na caixa acima 📥',
    howStep2Description:
      'Cole o link do Pinterest copiado na caixa de download do pinME.',
    howStep3Title: '3. Clique em "Baixar agora" ⬇️',
    howStep3Description:
      'Inicie o download e deixe o pinME processar a mídia solicitada.',
    howStep4Title: '4. Seu download é salvo no dispositivo 📱',
    howStep4Description:
      'O arquivo baixado é enviado diretamente para o seu dispositivo.',
    supportedDownloadsTitle: 'Downloads compatíveis',
    supportedVideos: 'Vídeos',
    supportedImages: 'Imagens individuais',
    supportedGifs: 'GIFs',
    supportedCarousels: 'Carrosséis',
    supportedCarouselsDescription: 'baixados como arquivo ZIP',
    faqPageTitle: 'Perguntas frequentes',
    faqPage1Question: '💯 O pinME é grátis?',
    faqPage1Answer:
      'Sim. O pinME é completamente grátis e não exige uma conta.',
    faqPage2Question: '🗂️ Onde vão os downloads?',
    faqPage2Answer:
      'O arquivo baixado é salvo na pasta Downloads do seu dispositivo. Dependendo do dispositivo, também pode aparecer na Galeria ou no aplicativo Fotos.',
    faqPage3Question: '🔒 Vocês armazenam meus links do Pinterest?',
    faqPage3Answer:
      'Não. Os links do Pinterest são processados apenas para fornecer o download solicitado e não são armazenados permanentemente.',
    faqPage4Question: '👤 Preciso de uma conta?',
    faqPage4Answer:
      'Não. Você pode usar o pinME sem criar uma conta ou fazer login.',
    faqPage5Question: '📦 Como os downloads de carrossel são entregues?',
    faqPage5Answer:
      'As imagens do carrossel são coletadas e fornecidas juntas em um arquivo ZIP.',
    faqPage6Question: '🔗 O pinME é afiliado ao Pinterest?',
    faqPage6Answer:
      'Não. O pinME é um serviço independente e não é afiliado, patrocinado ou oficialmente conectado ao Pinterest.',
  },

  bg: {
    heading:
      'Изтегляйте видеоклипове, изображения, GIF файлове и карусели от Pinterest',
    subtitle: 'Бързо, безплатно и директно на вашето устройство.',
    placeholder: 'Поставете Pinterest линк тук...',
    downloadNow: 'Изтегли сега',
    infoText:
      'Изтеглянето ще бъде запазено в папката Downloads на вашето устройство (и обикновено се появява автоматично в Галерия/Снимки).',
    howItWorks: 'Как работи?',
    step1: 'Копирайте линк към Pinterest видео 📎',
    step2: 'Поставете го в полето отгоре 📥',
    step3: 'Натиснете "Изтегли сега" 📹',
    step4: 'Видеото се запазва на вашето устройство 📱',
    faq: 'Често задавани въпроси',
    faq1Q: 'Pin ME безплатен ли е?',
    faq1A: 'Да, напълно безплатен. Не е необходим акаунт.',
    faq2Q: 'Къде отиват изтеглянията?',
    faq2A: 'Видеото се запазва в папката Downloads на вашето устройство.',
    faq3Q: 'Съхранявате ли моите линкове?',
    faq3A: 'Не. Линковете се обработват и изтриват незабавно.',

    checkingMedia: 'Проверка на типа медия...',
    fetchingInfo: 'Извличане на информация за видеото...',
    fetchingVideoInfo: 'Извличане на информация за видеото...',
    fetchingImageInfo: 'Извличане на информация за изображението...',
    fetchingCarouselInfo: 'Извличане на информация за карусела...',
    fetchingGifInfo: 'Извличане на информация за GIF файла...',
    downloadingVideo: 'Изтегляне на видео...',
    downloadingImage: 'Изтегляне на изображение...',
    downloadingGif: 'Изтегляне на GIF...',
    downloadingCarousel: 'Изтегляне на карусел...',
    processingVideo: 'Обработка на видео...',
    convertingImageSvg: 'Преобразуване на изображението в SVG...',
    convertingImagePng: 'Преобразуване на изображението в PNG...',
    convertingCarouselSvg: 'Преобразуване на карусела в SVG...',
    convertingCarouselPng: 'Преобразуване на карусела в PNG...',
    packagingCarousel: 'Опаковане на карусела...',
    preparingDownload: 'Подготовка за изтегляне...',
    startingDownload: 'Стартиране на изтеглянето...',

    videoDownloaded: 'Видеото е изтеглено',
    imageDownloaded: 'Изображението е изтеглено',
    carouselDownloaded: 'Каруселът е изтеглен като ZIP',
    imagesCount: 'изображения',
    errorGeneric:
      'Нещо се обърка. Проверете връзката си и опитайте отново.',
    serverStarting: 'Стартиране на сървъра',
    serverWakingText:
      'Сървърът се събужда — обикновено отнема 20–30 секунди. Изчакайте!',
    howItWorksFooter: 'Как работи и ЧЗВ',
    howItWorksHomeFooter: 'Как работи и ЧЗВ',
    privacyPolicy: 'Политика за поверителност',
    termsConditions: 'Общи условия',

    // How It Works page
    howItWorksClose: 'Затвори и се върни към началната страница',
    howItWorksHome: 'Върни се към началната страница',
    howItWorksPageTitle: 'Как работи и ЧЗВ',
    howItWorksPageSubtitle:
      'Научете как да използвате pinME и намерете отговори на често задавани въпроси.',
    howItWorksSectionTitle: 'Как работи',
    howStep1Title: '1. Копирайте Pinterest линк 📎',
    howStep1Description:
      'Копирайте Pinterest линка, който съдържа видеото, изображението, GIF файла или карусела, който искате да изтеглите.',
    howStep2Title: '2. Поставете го в полето отгоре 📥',
    howStep2Description:
      'Поставете копирания Pinterest линк в полето за изтегляне на pinME.',
    howStep3Title: '3. Натиснете "Изтегли сега" ⬇️',
    howStep3Description:
      'Стартирайте изтеглянето и оставете pinME да обработи заявената медия.',
    howStep4Title: '4. Изтеглянето се запазва на устройството ви 📱',
    howStep4Description:
      'Изтегленият файл се изпраща директно на вашето устройство.',
    supportedDownloadsTitle: 'Поддържани изтегляния',
    supportedVideos: 'Видеоклипове',
    supportedImages: 'Отделни изображения',
    supportedGifs: 'GIF файлове',
    supportedCarousels: 'Карусели',
    supportedCarouselsDescription: 'изтегляни като ZIP файл',
    faqPageTitle: 'Често задавани въпроси',
    faqPage1Question: '💯 Безплатен ли е pinME?',
    faqPage1Answer:
      'Да. pinME е напълно безплатен и не изисква акаунт.',
    faqPage2Question: '🗂️ Къде отиват изтеглянията?',
    faqPage2Answer:
      'Изтегленият файл се запазва в папката Downloads на устройството ви. В зависимост от устройството може да се появи и в Галерия или Снимки.',
    faqPage3Question: '🔒 Съхранявате ли Pinterest линковете ми?',
    faqPage3Answer:
      'Не. Pinterest линковете се обработват само за предоставяне на заявеното изтегляне и не се съхраняват постоянно.',
    faqPage4Question: '👤 Нужен ли ми е акаунт?',
    faqPage4Answer:
      'Не. Можете да използвате pinME без създаване на акаунт или влизане.',
    faqPage5Question: '📦 Как се предоставят изтеглянията на карусели?',
    faqPage5Answer:
      'Изображенията от карусела се събират и се предоставят заедно като ZIP файл.',
    faqPage6Question: '🔗 pinME свързан ли е с Pinterest?',
    faqPage6Answer:
      'Не. pinME е независима услуга и не е свързана, спонсорирана или официално свързана с Pinterest.',
  },

  de: {
    heading: 'Pinterest-Videos, -Bilder, GIFs & Karussells herunterladen',
    subtitle: 'Schnell, kostenlos und direkt auf dein Gerät.',
    placeholder: 'Pinterest-Link hier einfügen...',
    downloadNow: 'Jetzt herunterladen',
    infoText:
      'Dein Download wird im Downloads-Ordner deines Geräts gespeichert (und erscheint normalerweise automatisch in der Galerie/Fotos-App).',
    howItWorks: 'Wie funktioniert es?',
    step1: 'Pinterest-Video-Link kopieren 📎',
    step2: 'In das Feld oben einfügen 📥',
    step3: 'Auf "Jetzt herunterladen" klicken 📹',
    step4: 'Dein Video wird auf deinem Gerät gespeichert 📱',
    faq: 'Häufig gestellte Fragen',
    faq1Q: 'Ist Pin ME kostenlos?',
    faq1A: 'Ja, völlig kostenlos. Kein Konto erforderlich.',
    faq2Q: 'Wohin gehen die Downloads?',
    faq2A: 'Dein Video wird im Downloads-Ordner deines Geräts gespeichert.',
    faq3Q: 'Speichert ihr meine Links?',
    faq3A: 'Nein. Links werden sofort verarbeitet und gelöscht.',

    checkingMedia: 'Medientyp wird geprüft...',
    fetchingInfo: 'Videoinformationen werden abgerufen...',
    fetchingVideoInfo: 'Videoinformationen werden abgerufen...',
    fetchingImageInfo: 'Bildinformationen werden abgerufen...',
    fetchingCarouselInfo: 'Karussellinformationen werden abgerufen...',
    fetchingGifInfo: 'GIF-Informationen werden abgerufen...',
    downloadingVideo: 'Video wird heruntergeladen...',
    downloadingImage: 'Bild wird heruntergeladen...',
    downloadingGif: 'GIF wird heruntergeladen...',
    downloadingCarousel: 'Karussell wird heruntergeladen...',
    processingVideo: 'Video wird verarbeitet...',
    convertingImageSvg: 'Bild wird in SVG konvertiert...',
    convertingImagePng: 'Bild wird in PNG konvertiert...',
    convertingCarouselSvg: 'Karussell wird in SVG konvertiert...',
    convertingCarouselPng: 'Karussell wird in PNG konvertiert...',
    packagingCarousel: 'Karussell wird verpackt...',
    preparingDownload: 'Download wird vorbereitet...',
    startingDownload: 'Download wird gestartet...',

    videoDownloaded: 'Video heruntergeladen',
    imageDownloaded: 'Bild heruntergeladen',
    carouselDownloaded: 'Karussell als ZIP heruntergeladen',
    imagesCount: 'Bilder',
    errorGeneric:
      'Etwas ist schiefgelaufen. Überprüfe deine Verbindung und versuche es erneut.',
    serverStarting: 'Server wird gestartet',
    serverWakingText:
      'Der Server wacht auf — dies dauert normalerweise 20–30 Sekunden. Warte kurz!',
    howItWorksFooter: 'Wie es funktioniert & FAQ',
    howItWorksHomeFooter: 'Wie es funktioniert & FAQ',
    privacyPolicy: 'Datenschutzrichtlinie',
    termsConditions: 'Allgemeine Geschäftsbedingungen',

    // How It Works page
    howItWorksClose: 'Schließen und zur Startseite zurückkehren',
    howItWorksHome: 'Zur Startseite zurückkehren',
    howItWorksPageTitle: 'So funktioniert es & FAQ',
    howItWorksPageSubtitle:
      'Erfahre, wie du pinME verwendest und Antworten auf häufige Fragen findest.',
    howItWorksSectionTitle: 'So funktioniert es',
    howStep1Title: '1. Pinterest-Link kopieren 📎',
    howStep1Description:
      'Kopiere den Pinterest-Link mit dem Video, Bild, GIF oder Karussell, das du herunterladen möchtest.',
    howStep2Title: '2. Oben in das Feld einfügen 📥',
    howStep2Description:
      'Füge den kopierten Pinterest-Link in das Download-Feld von pinME ein.',
    howStep3Title: '3. Auf "Jetzt herunterladen" klicken ⬇️',
    howStep3Description:
      'Starte den Download und lass pinME die gewünschten Medien verarbeiten.',
    howStep4Title: '4. Dein Download wird auf deinem Gerät gespeichert 📱',
    howStep4Description:
      'Die heruntergeladene Datei wird direkt an dein Gerät gesendet.',
    supportedDownloadsTitle: 'Unterstützte Downloads',
    supportedVideos: 'Videos',
    supportedImages: 'Einzelne Bilder',
    supportedGifs: 'GIFs',
    supportedCarousels: 'Karussells',
    supportedCarouselsDescription: 'als ZIP-Datei heruntergeladen',
    faqPageTitle: 'Häufig gestellte Fragen',
    faqPage1Question: '💯 Ist pinME kostenlos?',
    faqPage1Answer:
      'Ja. pinME ist vollständig kostenlos und benötigt kein Konto.',
    faqPage2Question: '🗂️ Wohin gehen die Downloads?',
    faqPage2Answer:
      'Die heruntergeladene Datei wird im Downloads-Ordner deines Geräts gespeichert. Je nach Gerät kann sie auch in der Galerie oder Fotos-App erscheinen.',
    faqPage3Question: '🔒 Speichert ihr meine Pinterest-Links?',
    faqPage3Answer:
      'Nein. Pinterest-Links werden nur zur Bereitstellung des gewünschten Downloads verarbeitet und nicht dauerhaft gespeichert.',
    faqPage4Question: '👤 Benötige ich ein Konto?',
    faqPage4Answer:
      'Nein. Du kannst pinME ohne Konto oder Anmeldung verwenden.',
    faqPage5Question: '📦 Wie werden Karussell-Downloads bereitgestellt?',
    faqPage5Answer:
      'Die Bilder des Karussells werden gesammelt und gemeinsam als ZIP-Datei bereitgestellt.',
    faqPage6Question: '🔗 Ist pinME mit Pinterest verbunden?',
    faqPage6Answer:
      'Nein. pinME ist ein unabhängiger Dienst und nicht mit Pinterest verbunden, von Pinterest gesponsert oder offiziell damit verknüpft.',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;