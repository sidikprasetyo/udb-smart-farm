class DiseaseSolutionProvider:
    """Penyedia solusi untuk berbagai penyakit tanaman cabai"""
    
    def __init__(self):
        self.solutions = {
            'leaf_curl': {
                'name': 'Leaf Curl (Keriting Daun)',
                'description': 'Penyakit yang menyebabkan daun menggulung dan keriting',
                'causes': [
                    'Virus (Chili Leaf Curl Virus)',
                    'Serangan serangga vektor (kutu daun, thrips)',
                    'Kondisi lingkungan ekstrem',
                    'Kekurangan nutrisi'
                ],
                'symptoms': [
                    'Daun menggulung ke atas atau ke bawah',
                    'Daun menjadi tebal dan kaku',
                    'Pertumbuhan tanaman terhambat',
                    'Hasil panen menurun'
                ],
                'treatment': [
                    'Semprot dengan insektisida untuk mengendalikan vektor',
                    'Aplikasi pupuk mikro (Zn, B, Mo)',
                    'Pengaturan kelembaban dan suhu optimal',
                    'Pemangkasan daun yang terinfeksi parah'
                ],
                'prevention': [
                    'Gunakan varietas tahan virus',
                    'Pengendalian serangga vektor secara rutin',
                    'Sanitasi lingkungan',
                    'Rotasi tanaman',
                    'Pemupukan seimbang NPK + mikro'
                ],
                'organic_treatment': [
                    'Ekstrak daun mimba (neem)',
                    'Larutan sabun insektisida',
                    'Pupuk organik cair',
                    'Kompos + biochar'
                ],
                'urgency': 'Medium',
                'estimated_loss': '20-40%'
            },
            
            'leaf_spot': {
                'name': 'Leaf Spot (Bercak Daun)',
                'description': 'Penyakit jamur yang menyebabkan bercak pada daun',
                'causes': [
                    'Jamur Cercospora sp.',
                    'Jamur Colletotrichum sp.',
                    'Kelembaban tinggi',
                    'Sirkulasi udara buruk'
                ],
                'symptoms': [
                    'Bercak coklat atau hitam pada daun',
                    'Bercak memiliki tepi kuning',
                    'Daun menguning dan gugur',
                    'Penurunan fotosintesis'
                ],
                'treatment': [
                    'Fungisida berbahan aktif mankozeb atau klorotalonil',
                    'Perbaikan drainase dan sirkulasi udara',
                    'Pemangkasan daun terinfeksi',
                    'Pengaturan jarak tanam optimal'
                ],
                'prevention': [
                    'Hindari penyiraman pada daun',
                    'Perbaiki sirkulasi udara',
                    'Sanitasi kebun secara rutin',
                    'Gunakan mulsa organik',
                    'Aplikasi fungisida preventif'
                ],
                'organic_treatment': [
                    'Larutan baking soda 1%',
                    'Ekstrak bawang putih',
                    'Trichoderma sp. (bio-fungisida)',
                    'Compost tea'
                ],
                'urgency': 'High',
                'estimated_loss': '30-60%'
            },
            
            'whitefly': {
                'name': 'Whitefly (Kutu Kebul)',
                'description': 'Serangan hama kutu kebul yang menghisap cairan tanaman',
                'causes': [
                    'Bemisia tabaci (kutu kebul)',
                    'Kondisi lingkungan hangat dan lembab',
                    'Tanaman stress',
                    'Kurangnya predator alami'
                ],
                'symptoms': [
                    'Daun menguning dan layu',
                    'Embun jelaga (sooty mold) pada daun',
                    'Kutu putih kecil di bawah daun',
                    'Pertumbuhan tanaman terhambat'
                ],
                'treatment': [
                    'Insektisida sistemik (imidakloprid)',
                    'Perangkap kuning lengket',
                    'Semprot air bertekanan',
                    'Aplikasi predator alami (Encarsia formosa)'
                ],
                'prevention': [
                    'Monitoring rutin dengan perangkap kuning',
                    'Sanitasi gulma sekitar tanaman',
                    'Penggunaan mulsa reflektif',
                    'Penanaman tanaman perangkap',
                    'Pengendalian biologis dengan parasitoid'
                ],
                'organic_treatment': [
                    'Minyak neem',
                    'Sabun insektisida',
                    'Ekstrak daun tembakau',
                    'Larutan alkohol 70%'
                ],
                'urgency': 'High',
                'estimated_loss': '25-50%'
            },
            
            'yellowish': {
                'name': 'Yellowish (Menguning)',
                'description': 'Kondisi daun menguning karena berbagai faktor',
                'causes': [
                    'Kekurangan nitrogen',
                    'Kelebihan air (waterlogging)',
                    'Serangan penyakit akar',
                    'Kekurangan unsur mikro (Fe, Mg)',
                    'Stress lingkungan'
                ],
                'symptoms': [
                    'Daun menguning mulai dari yang tua',
                    'Pertumbuhan lambat',
                    'Daun mudah gugur',
                    'Sistem perakaran lemah'
                ],
                'treatment': [
                    'Aplikasi pupuk nitrogen (urea/ZA)',
                    'Perbaikan drainase tanah',
                    'Aplikasi pupuk mikro (Fe, Mg, Zn)',
                    'Pengaturan pH tanah 6.0-6.8',
                    'Fungisida untuk penyakit akar'
                ],
                'prevention': [
                    'Pemupukan berimbang NPK',
                    'Perbaikan struktur tanah dengan kompos',
                    'Pengaturan irigasi yang tepat',
                    'Monitoring pH tanah rutin',
                    'Aplikasi pupuk organik'
                ],
                'organic_treatment': [
                    'Kompos matang',
                    'Pupuk kandang fermentasi',
                    'Aplikasi mikroorganisme tanah',
                    'Mulsa organic'
                ],
                'urgency': 'Medium',
                'estimated_loss': '15-30%'
            },
            
            'healthy': {
                'name': 'Healthy (Sehat)',
                'description': 'Tanaman dalam kondisi sehat dan normal',
                'maintenance': [
                    'Pemupukan rutin sesuai jadwal',
                    'Penyiraman teratur',
                    'Monitoring hama dan penyakit',
                    'Pemangkasan tunas air',
                    'Pembersihan gulma'
                ],
                'prevention': [
                    'Sanitasi kebun rutin',
                    'Rotasi tanaman',
                    'Penggunaan varietas unggul',
                    'Pengendalian hama terpadu (PHT)',
                    'Monitoring cuaca dan lingkungan'
                ],
                'optimization': [
                    'Aplikasi pupuk organik',
                    'Penggunaan bio-stimulan',
                    'Peningkatan biodiversitas',
                    'Penerapan good agricultural practices'
                ],
                'urgency': 'Low',
                'estimated_loss': '0%'
            }
        }
    
    def get_solution(self, disease_name):
        """Mendapatkan solusi untuk penyakit tertentu"""
        return self.solutions.get(disease_name, self._get_default_solution())
    
    def _get_default_solution(self):
        """Solusi default untuk penyakit yang tidak dikenal"""
        return {
            'name': 'Unknown Disease',
            'description': 'Penyakit tidak teridentifikasi',
            'treatment': [
                'Konsultasi dengan ahli pertanian',
                'Isolasi tanaman yang terinfeksi',
                'Pengamatan gejala lebih detail',
                'Tes laboratorium jika diperlukan'
            ],
            'prevention': [
                'Sanitasi kebun',
                'Monitoring rutin',
                'Pemupukan seimbang',
                'Pengendalian lingkungan'
            ],
            'urgency': 'Medium',
            'estimated_loss': 'Unknown'
        }
    
    def get_all_diseases(self):
        """Mendapatkan daftar semua penyakit"""
        return list(self.solutions.keys())
    
    def get_treatment_schedule(self, disease_name):
        """Mendapatkan jadwal perawatan untuk penyakit tertentu"""
        solution = self.get_solution(disease_name)
        
        if disease_name == 'healthy':
            return {
                'daily': ['Monitoring visual', 'Pengaturan irigasi'],
                'weekly': ['Pemupukan daun', 'Pengendalian gulma'],
                'monthly': ['Pemupukan akar', 'Pemangkasan', 'Sanitasi']
            }
        
        schedule = {
            'immediate': ['Isolasi tanaman terinfeksi', 'Aplikasi treatment utama'],
            'daily': ['Monitoring perkembangan', 'Aplikasi treatment lanjutan'],
            'weekly': ['Evaluasi efektivitas treatment', 'Aplikasi treatment preventif'],
            'monthly': ['Assessment keseluruhan', 'Pencegahan kekambuhan']
        }
        
        return schedule
    
    def get_cost_estimation(self, disease_name, area_hectare=1):
        """Estimasi biaya pengobatan per hektar"""
        base_costs = {
            'leaf_curl': 500000,  # IDR
            'leaf_spot': 750000,
            'whitefly': 600000,
            'yellowish': 300000,
            'healthy': 100000  # maintenance
        }
        
        cost = base_costs.get(disease_name, 400000)
        return {
            'treatment_cost': cost * area_hectare,
            'prevention_cost': cost * 0.3 * area_hectare,
            'potential_loss': self._calculate_potential_loss(disease_name, area_hectare),
            'currency': 'IDR'
        }
    
    def _calculate_potential_loss(self, disease_name, area_hectare):
        """Menghitung potensi kerugian"""
        # Asumsi: hasil panen normal 10 ton/ha, harga Rp 15,000/kg
        normal_yield = 10000 * area_hectare  # kg
        price_per_kg = 15000  # IDR
        normal_revenue = normal_yield * price_per_kg
        
        loss_percentages = {
            'leaf_curl': 0.3,
            'leaf_spot': 0.45,
            'whitefly': 0.375,
            'yellowish': 0.225,
            'healthy': 0.0
        }
        
        loss_percentage = loss_percentages.get(disease_name, 0.25)
        return normal_revenue * loss_percentage

# Utility functions
def generate_treatment_report(disease_name, solution_provider):
    """Generate treatment report"""
    solution = solution_provider.get_solution(disease_name)
    schedule = solution_provider.get_treatment_schedule(disease_name)
    cost = solution_provider.get_cost_estimation(disease_name)
    
    report = {
        'disease_info': solution,
        'treatment_schedule': schedule,
        'cost_estimation': cost,
        'generated_at': datetime.now().isoformat()
    }
    
    return report

if __name__ == "__main__":
    from datetime import datetime
    
    provider = DiseaseSolutionProvider()
    
    # Test all diseases
    for disease in provider.get_all_diseases():
        print(f"\n=== {disease.upper()} ===")
        solution = provider.get_solution(disease)
        print(f"Name: {solution['name']}")
        print(f"Urgency: {solution.get('urgency', 'N/A')}")
        if 'treatment' in solution:
            print(f"Treatment: {solution['treatment'][:2]}")  # First 2 treatments
        print(f"Estimated Loss: {solution.get('estimated_loss', 'N/A')}")
        
        # Cost estimation
        cost = provider.get_cost_estimation(disease)
        print(f"Treatment Cost: Rp {cost['treatment_cost']:,}")
        print(f"Potential Loss: Rp {cost['potential_loss']:,}")
