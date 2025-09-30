import authService from './auth.service';
import entrepriseService from './entreprise.service';

class DashboardService {
  // Get salary evolution data for the last 12 months
  getSalaryEvolution() {
    return authService.axios.get('/dashboard/salary-evolution');
  }

  // Get employee distribution by company
  getEmployeeDistribution() {
    return authService.axios.get('/dashboard/employee-distribution');
  }

  // Get global statistics for super admin
  getGlobalStats() {
    return authService.axios.get('/dashboard/global-stats');
  }

  // Get salary evolution data (mock data for now)
  getMockSalaryEvolution() {
    const months = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ];

    const currentMonth = new Date().getMonth();
    const data = [];

    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const baseSalary = 4500000; // Base salary mass
      const variation = (Math.random() - 0.5) * 1000000; // Random variation

      data.push({
        month: months[monthIndex],
        salaryMass: Math.max(0, Math.round(baseSalary + variation)),
        fullMonth: months[monthIndex] + ' ' + new Date().getFullYear()
      });
    }

    return Promise.resolve({ data });
  }

  // Get employee distribution data from real database
  async getEmployeeDistribution() {
    try {
      const response = await entrepriseService.getEntreprises();
      const entreprises = response.data;

      // Calculate total employees across all companies
      const totalEmployees = entreprises.reduce((sum, entreprise) => sum + (entreprise.nombreEmployesActifs || 0), 0);

      // Filter companies that have active employees and create distribution data
      const companiesWithEmployees = entreprises
        .filter(entreprise => entreprise.nombreEmployesActifs > 0)
        .map(entreprise => ({
          name: entreprise.nom,
          value: entreprise.nombreEmployesActifs || 0,
          total: totalEmployees
        }))
        .sort((a, b) => b.value - a.value); // Sort by employee count descending

      return { data: companiesWithEmployees };
    } catch (error) {
      console.error('Erreur lors de la récupération de la répartition des employés:', error);
      // Return empty array as fallback
      return { data: [] };
    }
  }

  // Get global stats from real database
  async getGlobalStats() {
    try {
      const response = await entrepriseService.getEntreprises();
      const entreprises = response.data;

      // Calculate real statistics from database
      const totalEntreprises = entreprises.length;
      const totalEmployesActifs = entreprises.reduce((sum, entreprise) => sum + (entreprise.nombreEmployesActifs || 0), 0);
      const masseSalarialeTotale = entreprises.reduce((sum, entreprise) => sum + (entreprise.masseSalarialeMensuelle || 0), 0);

      // Calculate payment statistics (estimates based on available data)
      // In a real implementation, these would come from payment/bulletin APIs
      const montantTotalPaye = Math.round(masseSalarialeTotale * 0.8); // Estimate: 80% paid
      const montantTotalRestant = masseSalarialeTotale - montantTotalPaye;
      const totalBulletinsGeneres = totalEmployesActifs * 12; // Estimate: 12 bulletins per employee per year

      return {
        data: {
          totalEntreprises,
          totalEmployesActifs,
          masseSalarialeTotale,
          totalBulletinsGeneres,
          montantTotalPaye,
          montantTotalRestant
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      // Return default values as fallback
      return {
        data: {
          totalEntreprises: 0,
          totalEmployesActifs: 0,
          masseSalarialeTotale: 0,
          totalBulletinsGeneres: 0,
          montantTotalPaye: 0,
          montantTotalRestant: 0
        }
      };
    }
  }
}

const dashboardService = new DashboardService();
export default dashboardService;