interface ExpenseBreakdown {
  [category: string]: number;
}

interface AiRecommendation {
  emergencyFund: number;
  investment: number;
  sipIncrease: number;
  guiltFreeSpend: number;
  debtPayment: number;
  reasoning: string[];
}

export function generateRecommendation(
  savedAmount: number,
  expenseBreakdown: ExpenseBreakdown,
  totalSalary: number
): AiRecommendation {
  const reasoning: string[] = [];
  let emergencyFund = 0;
  let investment = 0;
  let sipIncrease = 0;
  let guiltFreeSpend = 0;
  let debtPayment = 0;

  const savingsRate = (savedAmount / totalSalary) * 100;

  // Savings tier logic
  if (savedAmount <= 0) {
    reasoning.push('⚠️ You overspent this cycle. Review your expenses and try cutting non-essential spending.');
    return { emergencyFund, investment, sipIncrease, guiltFreeSpend, debtPayment, reasoning };
  }

  if (savedAmount < 5000) {
    emergencyFund = savedAmount;
    reasoning.push(`Low savings (₹${savedAmount}). Putting everything into emergency fund.`);
    reasoning.push('Try to reduce discretionary spending next cycle.');
  } else if (savedAmount < 10000) {
    emergencyFund = Math.round(savedAmount * 0.5);
    investment = Math.round(savedAmount * 0.3);
    guiltFreeSpend = savedAmount - emergencyFund - investment;
    reasoning.push(`Moderate savings. Building emergency fund (₹${emergencyFund}) and investing (₹${investment}).`);
    reasoning.push(`Enjoy ₹${guiltFreeSpend} guilt-free! 🎉`);
  } else if (savedAmount < 20000) {
    emergencyFund = Math.round(savedAmount * 0.3);
    investment = Math.round(savedAmount * 0.4);
    sipIncrease = Math.round(savedAmount * 0.1);
    guiltFreeSpend = savedAmount - emergencyFund - investment - sipIncrease;
    reasoning.push(`Good savings! Consider increasing SIP by ₹${sipIncrease}.`);
    reasoning.push(`Investing ₹${investment} in diversified portfolio.`);
    reasoning.push(`Emergency: ₹${emergencyFund} | Fun: ₹${guiltFreeSpend}`);
  } else {
    emergencyFund = Math.round(savedAmount * 0.2);
    investment = Math.round(savedAmount * 0.4);
    sipIncrease = Math.round(savedAmount * 0.15);
    guiltFreeSpend = Math.round(savedAmount * 0.15);
    debtPayment = savedAmount - emergencyFund - investment - sipIncrease - guiltFreeSpend;
    reasoning.push(`Excellent savings (₹${savedAmount})! 🚀`);
    reasoning.push(`40% Index Funds (₹${investment})`);
    reasoning.push(`20% Emergency Fund (₹${emergencyFund})`);
    reasoning.push(`15% SIP Increase (₹${sipIncrease})`);
    reasoning.push(`15% Guilt-Free (₹${guiltFreeSpend})`);
    if (debtPayment > 0) {
      reasoning.push(`10% Debt/Extra (₹${debtPayment})`);
    }
  }

  // Category-specific advice
  const foodSpend = expenseBreakdown['Food'] || expenseBreakdown['food'] || 0;
  const foodPercent = totalSalary > 0 ? (foodSpend / totalSalary) * 100 : 0;
  if (foodPercent > 20) {
    reasoning.push(`💡 Food spending is ${foodPercent.toFixed(0)}% of salary. Consider meal prepping to save more.`);
  }

  const entertainmentSpend = expenseBreakdown['Entertainment'] || expenseBreakdown['entertainment'] || 0;
  const entertainmentPercent = totalSalary > 0 ? (entertainmentSpend / totalSalary) * 100 : 0;
  if (entertainmentPercent > 15) {
    reasoning.push(`💡 Entertainment is ${entertainmentPercent.toFixed(0)}% of salary. Look for free alternatives.`);
  }

  if (savingsRate > 30) {
    reasoning.push(`🌟 You saved ${savingsRate.toFixed(0)}% of your salary. Outstanding discipline!`);
  } else if (savingsRate > 20) {
    reasoning.push(`👍 Savings rate: ${savingsRate.toFixed(0)}%. Above average!`);
  }

  return { emergencyFund, investment, sipIncrease, guiltFreeSpend, debtPayment, reasoning };
}
