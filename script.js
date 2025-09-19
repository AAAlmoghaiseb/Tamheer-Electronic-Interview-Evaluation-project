// انتظر حتى يتم تحميل المستند بالكامل
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة المتغيرات
    let ratings = {
        technical: {},
        behavioral: {},
        cultural: {},
        impression: {}
    };
    
    let radarChart = null;
    
    // تحديد أزرار التقييم
    const ratingButtons = document.querySelectorAll('.rating-btn');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsCard = document.getElementById('resultsCard');
    const newEvaluationBtn = document.getElementById('newEvaluationBtn');
    
    // إضافة مستمع الحدث لأزرار التقييم
    ratingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            const category = this.getAttribute('data-category');
            const criteriaItem = this.closest('.criteria-item');
            const criteriaName = criteriaItem.querySelector('.criteria-name').textContent;
            
            // إزالة التحديد من جميع الأزرار في نفس المعيار
            criteriaItem.querySelectorAll('.rating-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // تحديد الزر المختار
            this.classList.add('selected');
            
            // تخزين التقييم
            ratings[category][criteriaName] = value;
        });
    });
    
    // إضافة مستمع الحدث لزر الحساب
    calculateBtn.addEventListener('click', function() {
        calculateResults();
        resultsCard.style.display = 'block';
        
        // التمرير إلى بطاقة النتائج
        resultsCard.scrollIntoView({ behavior: 'smooth' });
    });
    
    // إضافة مستمع الحدث لزر التقييم الجديد
    newEvaluationBtn.addEventListener('click', function() {
        resetEvaluation();
    });
    
    // إضافة مستمع الحدث لزر تصدير PDF
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-success')) {
            generatePDF();
        }
    });
    
    // دالة حساب النتائج
    function calculateResults() {
        // حساب متوسط كل فئة
        const technicalAvg = calculateCategoryAverage('technical');
        const behavioralAvg = calculateCategoryAverage('behavioral');
        const culturalAvg = calculateCategoryAverage('cultural');
        const impressionAvg = calculateCategoryAverage('impression');
        
        // حساب النتائج المرجحة
        const technicalWeighted = technicalAvg * 0.4;
        const behavioralWeighted = behavioralAvg * 0.35;
        const culturalWeighted = culturalAvg * 0.15;
        const impressionWeighted = impressionAvg * 0.1;
        
        // حساب النتيجة الإجمالية
        const totalScore = technicalWeighted + behavioralWeighted + culturalWeighted + impressionWeighted;
        
        // تحديث واجهة المستخدم بالنتائج
        updateResultsUI(
            technicalAvg, behavioralAvg, culturalAvg, impressionAvg,
            technicalWeighted, behavioralWeighted, culturalWeighted, impressionWeighted,
            totalScore
        );
        
        // إنشاء الرسم البياني الراداري
        createRadarChart(technicalAvg, behavioralAvg, culturalAvg, impressionAvg);
    }
    
    // دالة حساب متوسط الفئة
    function calculateCategoryAverage(category) {
        const values = Object.values(ratings[category]);
        if (values.length === 0) return 0;
        
        const sum = values.reduce((total, value) => total + value, 0);
        return sum / values.length;
    }
    
    // دالة تحديث واجهة المستخدم بالنتائج
    function updateResultsUI(
        technicalAvg, behavioralAvg, culturalAvg, impressionAvg,
        technicalWeighted, behavioralWeighted, culturalWeighted, impressionWeighted,
        totalScore
    ) {
        // تحويل المتوسطات إلى نسب مئوية
        const technicalPercent = Math.round((technicalAvg / 5) * 100);
        const behavioralPercent = Math.round((behavioralAvg / 5) * 100);
        const culturalPercent = Math.round((culturalAvg / 5) * 100);
        const impressionPercent = Math.round((impressionAvg / 5) * 100);
        
        // تحويل النتائج المرجحة إلى نسب مئوية
        const technicalWeightedPercent = Math.round(technicalWeighted * 20); // 20 = 100/5
        const behavioralWeightedPercent = Math.round(behavioralWeighted * 20);
        const culturalWeightedPercent = Math.round(culturalWeighted * 20);
        const impressionWeightedPercent = Math.round(impressionWeighted * 20);
        
        // تحويل النتيجة الإجمالية إلى نسبة مئوية
        const totalPercent = Math.round((totalScore / 5) * 100);
        
        // تحديث عناصر واجهة المستخدم
        document.getElementById('technicalScore').textContent = technicalPercent + '%';
        document.getElementById('behavioralScore').textContent = behavioralPercent + '%';
        document.getElementById('culturalScore').textContent = culturalPercent + '%';
        document.getElementById('impressionScore').textContent = impressionPercent + '%';
        
        document.getElementById('technicalWeighted').textContent = technicalWeightedPercent + '%';
        document.getElementById('behavioralWeighted').textContent = behavioralWeightedPercent + '%';
        document.getElementById('culturalWeighted').textContent = culturalWeightedPercent + '%';
        document.getElementById('impressionWeighted').textContent = impressionWeightedPercent + '%';
        
        document.getElementById('totalScore').textContent = totalPercent + '%';
        document.getElementById('finalScore').textContent = totalPercent + '%';
        document.getElementById('totalScoreDisplay').textContent = totalPercent + '%';
        
        // تحديد التصنيف والتوصية
        updateRatingAndRecommendation(totalPercent);
    }
    
    // دالة تحديد التصنيف والتوصية
    function updateRatingAndRecommendation(score) {
        let rating, recommendation, recommendationClass;
        
        if (score >= 90) {
            rating = 'ممتاز';
            recommendation = 'توظيف فوري - مرشح استثنائي';
            recommendationClass = 'text-success';
        } else if (score >= 80) {
            rating = 'جيد جداً';
            recommendation = 'توظيف مع ثقة - مرشح قوي';
            recommendationClass = 'text-success';
        } else if (score >= 70) {
            rating = 'جيد';
            recommendation = 'توظيف مع خطة تطوير - مرشح مناسب';
            recommendationClass = 'text-primary';
        } else if (score >= 60) {
            rating = 'مقبول';
            recommendation = 'مقابلة ثانية أو قائمة انتظار - مرشح متوسط';
            recommendationClass = 'text-warning';
        } else {
            rating = 'ضعيف';
            recommendation = 'غير مناسب حالياً - لا يُوصى بالتوظيف';
            recommendationClass = 'text-danger';
        }
        
        document.getElementById('finalRating').textContent = rating;
        
        const recommendationElement = document.getElementById('recommendation');
        recommendationElement.textContent = recommendation;
        recommendationElement.className = recommendationClass;
    }
    
    // دالة إنشاء الرسم البياني الراداري
    function createRadarChart(technicalAvg, behavioralAvg, culturalAvg, impressionAvg) {
        const ctx = document.getElementById('radarChart').getContext('2d');
        
        // إذا كان الرسم البياني موجوداً بالفعل، قم بتدميره
        if (radarChart) {
            radarChart.destroy();
        }
        
        // إنشاء رسم بياني جديد
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['المهارات التقنية', 'المهارات السلوكية', 'التوافق الثقافي', 'الانطباع العام'],
                datasets: [{
                    label: 'تقييم المرشح',
                    data: [technicalAvg, behavioralAvg, culturalAvg, impressionAvg],
                    backgroundColor: 'rgba(57, 73, 171, 0.2)',
                    borderColor: '#3949ab',
                    borderWidth: 2,
                    pointBackgroundColor: '#1a237e',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#1a237e'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // دالة إعادة تعيين التقييم
    function resetEvaluation() {
        // إعادة تعيين التقييمات
        ratings = {
            technical: {},
            behavioral: {},
            cultural: {},
            impression: {}
        };
        
        // إزالة تحديد جميع الأزرار
        ratingButtons.forEach(button => {
            button.classList.remove('selected');
        });
        
        // إخفاء بطاقة النتائج
        resultsCard.style.display = 'none';
        
        // مسح حقول النموذج
        document.getElementById('candidateName').value = '';
        document.getElementById('position').value = '';
        document.getElementById('interviewDate').value = '';
        document.getElementById('interviewer').value = '';
        document.getElementById('notes').value = '';
        
        // التمرير إلى أعلى الصفحة
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // دالة عرض مؤشر التحميل
    function showLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <p>جاري إنشاء تقرير PDF...</p>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Tajawal', sans-serif;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-content {
                text-align: center;
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(loadingOverlay);
    }
    
    // دالة إخفاء مؤشر التحميل
    function hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }
    
    // دالة عرض الإشعارات
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            font-family: 'Tajawal', sans-serif;
        `;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار تلقائياً بعد 5 ثوان
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // دالة تحويل الرسم البياني إلى صورة
    function getChartImage() {
        if (radarChart) {
            return radarChart.toBase64Image('image/png', 1);
        }
        return null;
    }
    
    // دالة إنشاء PDF
    async function generatePDF() {
        try {
            showLoading();
            
            // التحقق من وجود البيانات
            const candidateName = document.getElementById('candidateName').value;
            const position = document.getElementById('position').value;
            const interviewDate = document.getElementById('interviewDate').value;
            const interviewer = document.getElementById('interviewer').value;
            const notes = document.getElementById('notes').value;
            
            if (!candidateName || !position || !interviewer) {
                hideLoading();
                showNotification('يرجى ملء جميع الحقول المطلوبة', 'warning');
                return;
            }
            
            // التحقق من وجود تقييمات
            const hasRatings = Object.values(ratings).some(category => Object.keys(category).length > 0);
            if (!hasRatings) {
                hideLoading();
                showNotification('يرجى إكمال التقييم أولاً', 'warning');
                return;
            }
            
            // إنشاء مستند PDF جديد
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // إعداد الخط العربي
            doc.setFont('helvetica');
            doc.setFontSize(16);
            
            // العنوان الرئيسي
            doc.setFontSize(20);
            doc.text('Interview Evaluation Report', 105, 20, { align: 'center' });
            doc.text('تقرير تقييم المقابلة', 105, 30, { align: 'center' });
            
            // معلومات المرشح
            doc.setFontSize(14);
            let yPos = 50;
            
            doc.text('Candidate Information / معلومات المرشح:', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            doc.text(`Name / الاسم: ${candidateName}`, 20, yPos);
            yPos += 8;
            doc.text(`Position / الوظيفة: ${position}`, 20, yPos);
            yPos += 8;
            doc.text(`Interview Date / تاريخ المقابلة: ${interviewDate}`, 20, yPos);
            yPos += 8;
            doc.text(`Interviewer / المقيم: ${interviewer}`, 20, yPos);
            yPos += 15;
            
            // النتائج التفصيلية
            doc.setFontSize(14);
            doc.text('Evaluation Results / نتائج التقييم:', 20, yPos);
            yPos += 15;
            
            // حساب النتائج
            const technicalAvg = calculateCategoryAverage('technical');
            const behavioralAvg = calculateCategoryAverage('behavioral');
            const culturalAvg = calculateCategoryAverage('cultural');
            const impressionAvg = calculateCategoryAverage('impression');
            
            const technicalWeighted = technicalAvg * 0.4;
            const behavioralWeighted = behavioralAvg * 0.35;
            const culturalWeighted = culturalAvg * 0.15;
            const impressionWeighted = impressionAvg * 0.1;
            
            const totalScore = technicalWeighted + behavioralWeighted + culturalWeighted + impressionWeighted;
            const totalPercent = Math.round((totalScore / 5) * 100);
            
            // جدول النتائج
            doc.setFontSize(12);
            const tableData = [
                ['Category / الفئة', 'Score / النتيجة', 'Weight / الوزن', 'Weighted / المرجحة'],
                [`Technical Skills / المهارات التقنية`, `${Math.round((technicalAvg / 5) * 100)}%`, '40%', `${Math.round(technicalWeighted * 20)}%`],
                [`Behavioral Skills / المهارات السلوكية`, `${Math.round((behavioralAvg / 5) * 100)}%`, '35%', `${Math.round(behavioralWeighted * 20)}%`],
                [`Cultural Fit / التوافق الثقافي`, `${Math.round((culturalAvg / 5) * 100)}%`, '15%', `${Math.round(culturalWeighted * 20)}%`],
                [`Overall Impression / الانطباع العام`, `${Math.round((impressionAvg / 5) * 100)}%`, '10%', `${Math.round(impressionWeighted * 20)}%`],
                ['', '', 'Total / المجموع:', `${totalPercent}%`]
            ];
            
            // رسم الجدول
            let tableY = yPos;
            const colWidths = [60, 30, 30, 30];
            const rowHeight = 8;
            
            tableData.forEach((row, rowIndex) => {
                let xPos = 20;
                row.forEach((cell, colIndex) => {
                    if (rowIndex === 0 || rowIndex === tableData.length - 1) {
                        doc.setFillColor(240, 240, 240);
                        doc.rect(xPos, tableY - 2, colWidths[colIndex], rowHeight, 'F');
                    }
                    doc.text(cell, xPos + 2, tableY + 3);
                    doc.rect(xPos, tableY - 2, colWidths[colIndex], rowHeight);
                    xPos += colWidths[colIndex];
                });
                tableY += rowHeight;
            });
            
            yPos = tableY + 15;
            
            // التوصية
            doc.setFontSize(14);
            doc.text('Recommendation / التوصية:', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(12);
            let recommendation = '';
            if (totalPercent >= 90) {
                recommendation = 'Immediate Hire - Exceptional Candidate / توظيف فوري - مرشح استثنائي';
            } else if (totalPercent >= 80) {
                recommendation = 'Hire with Confidence - Strong Candidate / توظيف مع ثقة - مرشح قوي';
            } else if (totalPercent >= 70) {
                recommendation = 'Hire with Development Plan - Suitable Candidate / توظيف مع خطة تطوير - مرشح مناسب';
            } else if (totalPercent >= 60) {
                recommendation = 'Second Interview or Waitlist - Average Candidate / مقابلة ثانية أو قائمة انتظار - مرشح متوسط';
            } else {
                recommendation = 'Not Suitable Currently - Not Recommended / غير مناسب حالياً - لا يُوصى بالتوظيف';
            }
            
            const splitRecommendation = doc.splitTextToSize(recommendation, 170);
            doc.text(splitRecommendation, 20, yPos);
            yPos += splitRecommendation.length * 6 + 10;
            
            // الملاحظات
            if (notes) {
                doc.setFontSize(14);
                doc.text('Additional Notes / ملاحظات إضافية:', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(12);
                const splitNotes = doc.splitTextToSize(notes, 170);
                doc.text(splitNotes, 20, yPos);
                yPos += splitNotes.length * 6;
            }
            
            // إضافة الرسم البياني إذا كان متوفراً
            const chartImage = getChartImage();
            if (chartImage && yPos < 200) {
                doc.addImage(chartImage, 'PNG', 20, yPos + 10, 80, 60);
            }
            
            // تذييل الصفحة
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()} | تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')}`, 105, 280, { align: 'center' });
            
            // حفظ الملف
            const fileName = `Interview_Report_${candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            hideLoading();
            showNotification('تم إنشاء تقرير PDF بنجاح!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            hideLoading();
            showNotification('حدث خطأ أثناء إنشاء تقرير PDF', 'danger');
        }
    }
});
