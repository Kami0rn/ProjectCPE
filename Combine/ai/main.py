import os
import torch
from torchvision import transforms
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import matplotlib.pyplot as plt
import torchvision
import torch.nn as nn
import hashlib
import torch.optim as optim
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Flask app initialization
app = Flask(__name__)
UPLOAD_FOLDER = 'uploaded_images'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Define folders for saving samples and models
SAMPLES_FOLDER = 'generated_samples'
MODELS_FOLDER = 'saved_models'

# Ensure the folders exist
os.makedirs(SAMPLES_FOLDER, exist_ok=True)
os.makedirs(MODELS_FOLDER, exist_ok=True)

# -------------------------------
#   DCGAN Generator
# -------------------------------
class DCGANGenerator(nn.Module):
    def __init__(self, latent_dim=100, img_channels=3, feature_g=64):
        super(DCGANGenerator, self).__init__()
        self.net = nn.Sequential(
            nn.ConvTranspose2d(latent_dim, feature_g * 8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(feature_g * 8),
            nn.ReLU(True),
            nn.ConvTranspose2d(feature_g * 8, feature_g * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_g * 4),
            nn.ReLU(True),
            nn.ConvTranspose2d(feature_g * 4, feature_g * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_g * 2),
            nn.ReLU(True),
            nn.ConvTranspose2d(feature_g * 2, feature_g, 4, 2, 1, bias=False),
            nn.BatchNorm2d(feature_g),
            nn.ReLU(True),
            nn.ConvTranspose2d(feature_g, img_channels, 4, 2, 1, bias=False),
            nn.Tanh()
        )

    def forward(self, z):
        return self.net(z)

# -------------------------------
#   WGAN-GP Discriminator
# -------------------------------
class WGANDiscriminator(nn.Module):
    def __init__(self, img_channels=3, feature_d=64):
        super(WGANDiscriminator, self).__init__()
        self.net = nn.Sequential(
            nn.Conv2d(img_channels, feature_d, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(feature_d, feature_d * 2, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(feature_d * 2, feature_d * 4, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(feature_d * 4, feature_d * 8, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),
            nn.Conv2d(feature_d * 8, 1, 4, 1, 0, bias=False),
        )

    def forward(self, x):
        return self.net(x).view(-1)

# -------------------------------
#   Custom Dataset
# -------------------------------
class CustomImageDataset(Dataset):
    def __init__(self, img_dir, transform=None):
        self.img_dir = img_dir
        self.transform = transform
        self.img_paths = [os.path.join(img_dir, img_name) for img_name in os.listdir(img_dir) if os.path.isfile(os.path.join(img_dir, img_name))]

    def __len__(self):
        return len(self.img_paths)

    def __getitem__(self, idx):
        image = Image.open(self.img_paths[idx]).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, 0

# -------------------------------
#   REST API Endpoint
# -------------------------------
@app.route('/train', methods=['POST'])
def train_model():
    import shutil

    # Get username and model_name from the request
    username = request.form.get('username')
    model_name = request.form.get('model_name')
    if not username or not model_name:
        return jsonify({'error': 'Username and model_name are required'}), 400

    # Define user-specific folders under /user_data
    base_path = os.path.join('user_data', username, model_name)
    upload_folder = os.path.join(base_path, 'uploaded_images')
    samples_folder = os.path.join(base_path, 'generated_samples')
    models_folder = os.path.join(base_path, 'saved_models')

    # Clear and recreate the folders
    for folder in [upload_folder, samples_folder, models_folder]:
        if os.path.exists(folder):
            shutil.rmtree(folder)
        os.makedirs(folder, exist_ok=True)

    # Save uploaded images
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400

    images = request.files.getlist('images')
    if len(images) == 0:
        return jsonify({'error': 'No images provided'}), 400

    for img in images:
        filename = secure_filename(img.filename)
        img.save(os.path.join(upload_folder, filename))

    # Get hyperparameters from the request
    epochs = request.form.get('epochs', type=int, default=100)
    latent_dim = request.form.get('latent_dim', type=int, default=100)
    batch_size = request.form.get('batch_size', type=int, default=64)
    lr = request.form.get('lr', type=float, default=0.0001)
    n_critic = request.form.get('n_critic', type=int, default=5)
    lambda_gp = request.form.get('lambda_gp', type=float, default=10)

    # Transform and dataset
    transform = transforms.Compose([
        transforms.Resize((64, 64)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])
    dataset = CustomImageDataset(img_dir=upload_folder, transform=transform)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    # Initialize models
    generator = DCGANGenerator(latent_dim=latent_dim).to(device)
    discriminator = WGANDiscriminator().to(device)

    # Apply weight initialization
    generator.apply(weights_init)
    discriminator.apply(weights_init)

    # Optimizers
    optimizer_G = optim.Adam(generator.parameters(), lr=lr, betas=(0.5, 0.9))
    optimizer_D = optim.Adam(discriminator.parameters(), lr=lr, betas=(0.5, 0.9))

    # Training loop
    for epoch in range(epochs):
        for i, (imgs, _) in enumerate(dataloader):
            real_imgs = imgs.to(device)
            batch_size_now = real_imgs.size(0)

            # Train Discriminator
            optimizer_D.zero_grad()
            z = torch.randn(batch_size_now, latent_dim, 1, 1, device=device)
            fake_imgs = generator(z).detach()
            real_validity = discriminator(real_imgs)
            fake_validity = discriminator(fake_imgs)
            gradient_penalty = compute_gradient_penalty(discriminator, real_imgs.data, fake_imgs.data)
            loss_D = -torch.mean(real_validity) + torch.mean(fake_validity) + lambda_gp * gradient_penalty
            loss_D.backward()
            optimizer_D.step()

            # Train Generator
            if i % n_critic == 0:
                optimizer_G.zero_grad()
                z = torch.randn(batch_size_now, latent_dim, 1, 1, device=device)
                gen_imgs = generator(z)
                loss_G = -torch.mean(discriminator(gen_imgs))
                loss_G.backward()
                optimizer_G.step()

        print(f"[Epoch {epoch}/{epochs}] [D loss: {loss_D.item():.4f}] [G loss: {loss_G.item():.4f}]")

        # Save generated samples every 10 epochs
        if epoch % 10 == 0:
            z = torch.randn(16, latent_dim, 1, 1, device=device)  # Generate 16 samples
            sample_imgs = generator(z).detach().cpu()
            grid = torchvision.utils.make_grid(sample_imgs, normalize=True, nrow=4)
            save_path = os.path.join(samples_folder, f'samples_epoch_{epoch}.png')
            torchvision.utils.save_image(grid, save_path)
            print(f"Saved generated samples to {save_path}")

    # Save the trained models
    torch.save(generator.state_dict(), os.path.join(models_folder, 'generator.pth'))
    torch.save(discriminator.state_dict(), os.path.join(models_folder, 'discriminator.pth'))

    # Generate AI proof using the generated images (e.g., hash of the first sample image)
    ai_proof = generate_ai_proof(generator)

    return jsonify({
        'message': 'Training complete',
        'epochs': epochs,
        'generator_model': os.path.join(models_folder, 'generator.pth'),
        'discriminator_model': os.path.join(models_folder, 'discriminator.pth'),
        'ai_proof': ai_proof
    })
    
def generate_ai_proof(generator):
    # Generate a sample image (for proof generation)
    z = torch.randn(1, 100, 1, 1, device=device)  # Latent vector for 1 sample
    generated_img = generator(z).detach().cpu()
    
    # Convert to a byte array and hash the image (for unique proof)
    img = generated_img.squeeze(0).permute(1, 2, 0).numpy()  # Convert to HxWxC
    img_hash = hashlib.sha256(img.tobytes()).hexdigest()  # Create a SHA-256 hash for proof
    return img_hash

# -------------------------------
#   Gradient Penalty
# -------------------------------
def compute_gradient_penalty(D, real_samples, fake_samples):
    alpha = torch.rand((real_samples.size(0), 1, 1, 1), device=device, requires_grad=True)
    interpolates = (alpha * real_samples + (1 - alpha) * fake_samples).requires_grad_(True)
    d_interpolates = D(interpolates)
    gradients = torch.autograd.grad(
        outputs=d_interpolates,
        inputs=interpolates,
        grad_outputs=torch.ones_like(d_interpolates),
        create_graph=True,
        retain_graph=True,
        only_inputs=True
    )[0]
    gradients = gradients.view(gradients.size(0), -1)
    gradient_penalty = ((gradients.norm(2, dim=1) - 1) ** 2).mean()
    return gradient_penalty

# -------------------------------
#   Weight Initialization
# -------------------------------
def weights_init(m):
    classname = m.__class__.__name__
    if classname.find('Conv') != -1:
        nn.init.normal_(m.weight.data, 0.0, 0.02)
    elif classname.find('BatchNorm') != -1:
        nn.init.normal_(m.weight.data, 1.0, 0.02)
        nn.init.constant_(m.bias.data, 0)

# -------------------------------
#   Run Flask App
# -------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)