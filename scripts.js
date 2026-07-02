const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const formatDate = (date) => date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
});

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setError = (element, message) => {
    if (!element) return;
    element.textContent = message;
    element.style.display = message ? 'block' : 'none';
};

const clearErrors = (form) => {
    const errors = form.querySelectorAll('.error-message');
    errors.forEach((node) => {
        node.textContent = '';
        node.style.display = 'none';
    });
};

const setResultVisibility = (resultElement, visible) => {
    if (!resultElement) return;
    resultElement.style.display = visible ? 'grid' : 'none';
};

const renderBmiResult = ({ bmi, category, explanation, idealMin, idealMax, guidance }) => {
    $('#bmiValue').textContent = bmi.toFixed(1);
    $('#bmiCategory').textContent = category;
    $('#bmiCategory').className = `badge badge--${category.toLowerCase().replace(' ', '')}`;
    $('#bmiExplanation').textContent = explanation;
    $('#idealWeight').textContent = `${idealMin.toFixed(1)} kg — ${idealMax.toFixed(1)} kg`;
    $('#bmiGuidance').textContent = guidance;
    setResultVisibility($('#bmiResult'), true);
};

const bmiCategoryDetails = (bmi) => {
    if (bmi < 18.5) {
        return {
            category: 'Underweight',
            explanation: 'Your BMI is below the healthy range. A balanced diet and strength-building exercise can help support healthy weight gain.',
            guidance: 'Aim for a gradual, sustainable increase in weight with nutrient-dense foods and professional guidance if needed.'
        };
    }
    if (bmi < 24.9) {
        return {
            category: 'Normal',
            explanation: 'You are within a healthy BMI range. Keep maintaining your current habits for long-term wellbeing.',
            guidance: 'Continue regular activity, balanced nutrition, and routine health checkups to stay on track.'
        };
    }
    if (bmi < 29.9) {
        return {
            category: 'Overweight',
            explanation: 'Your BMI is above the healthy range. Small lifestyle improvements can help you move toward a healthier weight.',
            guidance: 'Try adding more activity, managing portions, and staying hydrated to support gradual change.'
        };
    }
    return {
        category: 'Obese',
        explanation: 'Your BMI is in the obese range, which can increase health risks. Working with a healthcare professional may be beneficial.',
        guidance: 'Focus on safe dietary adjustments, consistent movement, and support from qualified providers.'
    };
};

const calculateBmi = () => {
    const weightInput = $('#weightInput');
    const heightInput = $('#heightInput');
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const form = $('#bmiForm');

    clearErrors(form);
    setResultVisibility($('#bmiResult'), false);

    let hasError = false;
    if (Number.isNaN(weight)) {
        setError($('#weightError'), 'Please enter your weight in kilograms.');
        hasError = true;
    } else if (weight <= 0 || weight > 500) {
        setError($('#weightError'), 'Weight must be between 1 and 500 kg.');
        hasError = true;
    }

    if (Number.isNaN(height)) {
        setError($('#heightError'), 'Please enter your height in meters.');
        hasError = true;
    } else if (height < 0.5 || height > 2.5) {
        setError($('#heightError'), 'Height must be between 0.5 and 2.5 meters.');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    const bmi = weight / (height * height);
    const idealMin = 18.5 * height * height;
    const idealMax = 24.9 * height * height;
    const details = bmiCategoryDetails(bmi);

    renderBmiResult({ bmi, idealMin, idealMax, ...details });
};

const initBmiPage = () => {
    const form = $('#bmiForm');
    const liveToggle = $('#bmiLiveToggle');

    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        calculateBmi();
    });

    $('#weightInput').addEventListener('input', () => {
        if (liveToggle.checked) calculateBmi();
    });

    $('#heightInput').addEventListener('input', () => {
        if (liveToggle.checked) calculateBmi();
    });
};

const formatHeight = (meters) => {
    const centimeters = meters * 100;
    const totalInches = meters / 0.0254;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { meters, centimeters, feet, inches };
};

const calculateHeightConversion = () => {
    const form = $('#heightForm');
    const unit = $('#heightUnit').value;
    const metersValue = parseFloat($('#heightMetersInput').value);
    const centimetersValue = parseFloat($('#heightCentimetersInput').value);
    const feetValue = parseInt($('#heightFeetInput').value, 10);
    const inchesValue = parseFloat($('#heightInchesInput').value);

    clearErrors(form);
    setResultVisibility($('#heightResult'), false);

    if (unit === 'meters' || unit === 'centimeters') {
        const metricValue = unit === 'meters' ? metersValue : centimetersValue;
        if (Number.isNaN(metricValue)) {
            setError($('#heightError'), 'Enter a numeric height value.');
            return;
        }
        if (metricValue <= 0) {
            setError($('#heightError'), 'Height must be greater than zero.');
            return;
        }
    }

    if (unit === 'feet-inches') {
        const feet = Number.isNaN(feetValue) ? -1 : feetValue;
        const inches = Number.isNaN(inchesValue) ? -1 : inchesValue;
        if (feet < 0 || inches < 0 || inches >= 12) {
            setError($('#heightError'), 'Enter a valid height using feet and inches.');
            return;
        }
    }

    let meters;
    if (unit === 'meters') {
        meters = metersValue;
    } else if (unit === 'centimeters') {
        meters = centimetersValue / 100;
    } else {
        meters = (feetValue * 0.3048) + (inchesValue * 0.0254);
    }

    const converted = formatHeight(meters);
    $('#convertedMeters').textContent = `${converted.meters.toFixed(2)} m`;
    $('#convertedCentimeters').textContent = `${converted.centimeters.toFixed(0)} cm`;
    $('#convertedFeetInches').textContent = `${converted.feet} ft ${converted.inches} in`;
    setResultVisibility($('#heightResult'), true);
};

const toggleHeightInputs = () => {
    const unit = $('#heightUnit').value;
    document.querySelectorAll('.height-input-group').forEach((group) => {
        group.style.display = group.dataset.unit === unit ? 'grid' : 'none';
    });
    setResultVisibility($('#heightResult'), false);
    clearErrors($('#heightForm'));
};

const initHeightPage = () => {
    const form = $('#heightForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        calculateHeightConversion();
    });

    $('#heightUnit').addEventListener('change', toggleHeightInputs);
    toggleHeightInputs();
};

const calculateEdd = () => {
    const form = $('#eddForm');
    const lmpValue = $('#lmpInput').value;

    clearErrors(form);
    setResultVisibility($('#eddResult'), false);

    if (!lmpValue) {
        setError($('#lmpError'), 'Please choose your last menstrual period date.');
        return;
    }

    const lmpDate = new Date(lmpValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lmpDate > today) {
        setError($('#lmpError'), 'The date cannot be in the future.');
        return;
    }

    const maxPastDate = new Date(today);
    maxPastDate.setMonth(maxPastDate.getMonth() - 12);
    if (lmpDate < maxPastDate) {
        setError($('#lmpError'), 'Please enter a date within the past 12 months.');
        return;
    }

    const eddDate = new Date(lmpDate);
    eddDate.setDate(eddDate.getDate() + 280);
    const diffMs = eddDate - today;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeksRemaining = Math.max(0, Math.floor(daysRemaining / 7));
    const pregnancyDays = Math.max(0, Math.min(280, Math.floor((today - lmpDate) / (1000 * 60 * 60 * 24))));
    const progress = Math.round((pregnancyDays / 280) * 100);
    const trimester = pregnancyDays < 14 ? 'First trimester' : pregnancyDays < 140 ? 'Second trimester' : 'Third trimester';

    $('#eddDate').textContent = formatDate(eddDate);
    $('#remainingWeeks').textContent = `${weeksRemaining} week${weeksRemaining === 1 ? '' : 's'}`;
    $('#remainingDays').textContent = `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
    $('#trimesterLabel').textContent = trimester;
    $('#progressValue').textContent = `${clamp(progress, 0, 100)}%`;
    $('#progressBarFill').style.width = `${clamp(progress, 0, 100)}%`;

    setResultVisibility($('#eddResult'), true);
};

const initEddPage = () => {
    const form = $('#eddForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        calculateEdd();
    });
};

const calculateMenstrual = () => {
    const form = $('#menstrualForm');
    const lmpValue = $('#menstrualLmp').value;
    const cycleLength = parseInt($('#cycleLength').value, 10);

    clearErrors(form);
    setResultVisibility($('#menstrualResult'), false);

    if (!lmpValue) {
        setError($('#menstrualLmpError'), 'Please choose the first day of your last cycle.');
        return;
    }

    if (Number.isNaN(cycleLength) || cycleLength < 21 || cycleLength > 35) {
        setError($('#cycleLengthError'), 'Cycle length should be between 21 and 35 days.');
        return;
    }

    const lmpDate = new Date(lmpValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lmpDate > today) {
        setError($('#menstrualLmpError'), 'The date cannot be in the future.');
        return;
    }

    const nextPeriod = new Date(lmpDate);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

    const ovulation = new Date(lmpDate);
    ovulation.setDate(ovulation.getDate() + cycleLength - 14);

    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    const daysUntilNext = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24));

    $('#nextPeriodDate').textContent = formatDate(nextPeriod);
    $('#ovulationDate').textContent = formatDate(ovulation);
    $('#fertileStartDate').textContent = formatDate(fertileStart);
    $('#fertileEndDate').textContent = formatDate(fertileEnd);
    $('#daysUntilNextPeriod').textContent = `${Math.max(daysUntilNext, 0)} day${daysUntilNext === 1 ? '' : 's'}`;
    $('#cycleAdvice').textContent = daysUntilNext < 0 ? 'Your next period may already be due. Consider checking your calendar and tracking your cycle.' : 'Use this window to plan for your next period and fertile days with confidence.';

    setResultVisibility($('#menstrualResult'), true);
};

const initMenstrualPage = () => {
    const form = $('#menstrualForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        calculateMenstrual();
    });
};

const initNavbarToggle = () => {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        const isHidden = nav.classList.toggle('hidden');
        toggle.setAttribute('aria-expanded', String(!isHidden));
    });
};

const initPage = () => {
    const page = document.body.dataset.page;
    if (!page) return;

    setTimeout(() => {
        document.body.classList.add('ready');
    }, 100);

    initNavbarToggle();
    if (page === 'bmi') initBmiPage();
    if (page === 'height') initHeightPage();
    if (page === 'edd') initEddPage();
    if (page === 'menstrual') initMenstrualPage();
};

document.addEventListener('DOMContentLoaded', initPage);
